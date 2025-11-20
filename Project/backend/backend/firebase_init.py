import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("../threads-dbms-project-firebase-adminsdk-fbsvc-f5e752b00a.json")
firebase_admin.initialize_app(cred)