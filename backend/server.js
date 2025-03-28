const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import CORS
const path = require('path');  // Tambahkan path untuk menentukan lokasi file kredensial

// Ganti dengan path yang sesuai di file kredensial Firebase yang Anda unduh
const serviceAccount = path.join(__dirname, 'salon-booking-b86c9-firebase-adminsdk-fbsvc-b55ba5048b.json');

// Inisialisasi Firebase Admin SDK dengan kredensial
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = 5000;

// Menggunakan middleware CORS untuk mengizinkan request dari origin tertentu
app.use(cors({
  origin: 'http://localhost:5173', // Ganti dengan URL frontend Anda
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// API untuk membuat customer
app.post('/createCustomer', async (req, res) => {
  const { firstName, lastName, email, password, phone, address, city, province, zipCode } = req.body;

  if (!firstName || !lastName || !email || !password || !phone || !address || !city || !province || !zipCode) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    // Daftarkan pengguna menggunakan Admin SDK
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    // Simpan data tambahan pengguna ke Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      fullName: `${firstName} ${lastName}`,
      address,
      city,
      province,
      zipCode,
      phone,
      email: userRecord.email,
      role: 'customer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Kirimkan UID ke frontend setelah berhasil
    res.status(200).send({ message: 'Customer created successfully', uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).send({ message: 'Error creating customer', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});