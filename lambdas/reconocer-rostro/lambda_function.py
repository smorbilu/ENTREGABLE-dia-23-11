import base64
import json
import os
import re

import boto3

rekognition = boto3.client("rekognition")
COLLECTION_ID = os.environ.get("COLLECTION_ID", "rostros-udv")
SIMILITUD_MINIMA = float(os.environ.get("SIMILITUD_MINIMA", "85"))
CONFIANZA_MINIMA = float(os.environ.get("LIVENESS_MIN_CONFIDENCE", "80"))
SESION_VALIDA = re.compile(r"^[0-9a-fA-F-]{36}$")


def responder(status, cuerpo):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json; charset=utf-8"},
        "body": json.dumps(cuerpo, ensure_ascii=False),
    }


def leer_cuerpo(event):
    crudo = event.get("body") or ""
    if event.get("isBase64Encoded"):
        crudo = base64.b64decode(crudo).decode("utf-8")
    datos = json.loads(crudo)
    if not isinstance(datos, dict):
        raise ValueError("El cuerpo no es un objeto JSON")
    return datos


def lambda_handler(event, context):
    try:
        datos = leer_cuerpo(event)
    except ValueError:
        return responder(400, {"error": "El cuerpo debe ser un JSON válido"})

    session_id = str(datos.get("sessionId", "")).strip()
    if not SESION_VALIDA.match(session_id):
        return responder(400, {"error": "El campo sessionId es obligatorio (lo devuelve POST /sesion)"})

    try:
        sesion = rekognition.get_face_liveness_session_results(SessionId=session_id)
    except rekognition.exceptions.SessionNotFoundException:
        return responder(404, {"error": "La sesión no existe o ya expiró"})

    estado = sesion["Status"]
    confianza = sesion.get("Confidence", 0.0)
    if estado != "SUCCEEDED" or confianza < CONFIANZA_MINIMA:
        return responder(200, {"vivo": False, "estado": estado, "confianza": confianza, "match": False})

    imagen = (sesion.get("ReferenceImage") or {}).get("Bytes")
    if not imagen:
        return responder(500, {"error": "La sesión no trae imagen de referencia"})

    try:
        resultado = rekognition.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={"Bytes": imagen},
            FaceMatchThreshold=SIMILITUD_MINIMA,
            MaxFaces=1,
        )
    except rekognition.exceptions.InvalidParameterException:
        return responder(400, {"error": "No se detectó un rostro en la imagen"})

    vivo = {"vivo": True, "estado": estado, "confianza": confianza}
    coincidencias = resultado["FaceMatches"]
    if not coincidencias:
        return responder(200, {**vivo, "match": False})

    mejor = coincidencias[0]
    return responder(200, {
        **vivo,
        "match": True,
        "id": mejor["Face"]["ExternalImageId"],
        "similarity": mejor["Similarity"],
    })
