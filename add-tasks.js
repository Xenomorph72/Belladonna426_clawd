const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "dash-clawd",
  "private_key_id": "434e92d575baaf9fa737e5a532b2c99f7d39b3cd",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDgdGluG0wDNVqo\nvZ+IrGd0Vd8oJUMql1QT3LSdkNLztaRqh5zyDVgbLMYoVHTeb72sDaJnz3QA35I3\nD19DmEuTGKCigOMmB7jkMIaJA+Y9Vl18y91oNkcIhx4Pk20ftjOMnYzTQ9tHNkte\nn0FLtdLZbCjgYC/lS/LUzpasj/BYmTIpVdAZLfmbeGDuIwvIOZ1czAxYNdG52USa\nn52uv0Yq6u8W1UjfWrRTvDp15oXpU6D5FRm51GWEf12Ck9GOclSGwyn0uZb06Vgr\njNYgLOq29GS4oHQGn3lRdyKeBwSwahIcXHro3IWv1lsxUjFejIK50oAPqAs6ahh/\n+FtNAHZhAgMBAAECggEAGx8V6j8UJUMaLE+Val9itNT3fRNblVbpyuidTnjEdLxb\nHKA8X6crIUV8wDzMTmB0K8kN+btAiiZ5tXt/CFzrrN+J8XjfeaXvOmt+pim5dWnt\nK/o6S7BbTvV8tWccBXvvqKsU7CZD5cvyuYFG044p5ynBmrMktnFB62L3I+zUnu/S\nCJze0weatCNe/+PtUG8w0wmnBlHyzMouzX0QAroOk0uEesei+QS3rk4FzdOKdbmy\nt4L17yxK6+xP76YcCq9naUjeXYq9eSssRWnUTcqWNQ2RXgMnoNK6nDWEx7/eorX6\ny0h8QqqSTGo/Q36GAYHIs1nxTLtC9mrVU9t7g9IGUQKBgQDwq228ZodViqu0f+Cx\nVZM6DLiEuee/FstjatedgS/s1KMubcobrjttqJFRyZJRuDvRaozvaA1aKNRc9idp\n89vSZVoQvE2TbUiII+r9UvVvr81ZAbavxqbl8VWms3c7A3yRtW7Mv2zWYl00eNFN\nqlmQ2pKyG/aYZpkzjOB8FrnABQKBgQDuwJGOD1oQ64YQ9c9bwveNr7/t5yOnzboR\nbfu9lyvNq/HVeDF+DbvY0dc1vxFPNXO8QCYJmZGzhI3xxrVHzOg6iRuGNv8BbnTl\n3TctBsuScc6/DDVDMzCukJXUlNdIipvLS8Ozr1doeVLi13rcRIPSL9pO2fmMYFl0\nAgjcKdhXrQKBgH72IJzMBcb1saE1+MX0XAe6oDi8jen7z23x9i8L8MliX3dlycIS\nhx1RWOApkzvzEfNm31SIssqGUYl8/cviLmvutbWwcMg+VY4kTJo5AmtZ9d1njwVp\nqbASQVoAwPxr2XJQoVP4BCWQnJTKy7fKDxfghpTZNZyuO1G7ls0/e9w1AoGAR5A5\nENfRK1ktalADw4GBKlsPsIOj0Fx99VN+LanuW0u6xT2tuBbtw2PCmj2XNqLS+g5Q\nWHhLj/+ffGUPWWI2CbWnJme9r/Qn3e6c50YuJssuKV3DaU0ivnBgOMQUc434fMtM\n8cMQ9CPJkGz+Sp/O02W8jf4QKt+GcJtbhIKWclECgYB/R59tjixXM+RWq0dZDb40\np20xc5JIG1iTgU1ynF0h0eLCkVp9bprsFLSHbzI4cS0ahWhWSYPQvKq2ntLzVo0Z\nTFoCBGUT7j5qkwyjxVB29hVJxYh5zh5/klH6MVC/AwIbLDEmCaa/Jd/VW7l8wLhK\n5cV2tnFy9OL57T44OBRrBQ==\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-fbsvc@dash-clawd.iam.gserviceaccount.com",
  "client_id": "105500631919011685187",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tasks = [
  { title: 'Create Cover Document for Patreon Music Expert Package', section: 'content', status: 'todo', assignee: 'belladonna', priority: 'medium', description: 'Write cover document explaining Suno workflow basics for human users. Include: Suno fundamentals, one track at a time till gold methodology, common pitfalls (copyright names, tempo traps, style mixing), how to use AI technical documents effectively, and personal lessons learned from THE FINE PRINT album process.', createdAt: Date.now() },
  { title: 'End of year review prep', section: 'tesco', status: 'backlog', assignee: 'paul', createdAt: Date.now() - 1000 },
  { title: 'Create script for Z-IMAGE BASE install video', section: 'film426', status: 'backlog', assignee: 'paul', createdAt: Date.now() - 2000 },
  { title: 'Transcribe Z-IMAGE BASE audio → pro script', section: 'film426', status: 'backlog', assignee: 'belladonna', createdAt: Date.now() - 3000 },
  { title: 'Get Belladonna vision capabilities', section: 'film426', status: 'backlog', assignee: 'belladonna', createdAt: Date.now() - 4000 },
  { title: 'Figure out why Gemini key is locking', section: 'film426', status: 'backlog', assignee: 'belladonna', createdAt: Date.now() - 5000 },
  { title: 'Investigate whether Moltbook is worthwhile', section: 'film426', status: 'backlog', assignee: 'belladonna', createdAt: Date.now() - 6000 }
];

async function addTasks() {
  for (const task of tasks) {
    const id = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    await db.collection('tasks').doc(id).set({
      ...task,
      id: id,
      updatedAt: Date.now()
    });
    console.log('Added:', task.title);
  }
  console.log('All tasks added!');
  process.exit(0);
}

addTasks().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
