import json

import boto3
from botocore.exceptions import ClientError

rekognition = boto3.client("rekognition")


def responder(status, cuerpo):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json; charset=utf-8"},
        "body": json.dumps(cuerpo, ensure_ascii=False),
    }


def lambda_handler(event, context):
    try:
        sesion = rekognition.create_face_liveness_session()
    except ClientError as error:
        print("Error al crear la sesión:", error)
        return responder(500, {"error": "No se pudo crear la sesión de prueba de vida"})

    return responder(200, {"sessionId": sesion["SessionId"]})
