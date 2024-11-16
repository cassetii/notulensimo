// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCpYhHsiboqvtCXJqBqSJxTjOVgnVU1zc0",
    authDomain: "notulensimo.firebaseapp.com",
    projectId: "notulensimo",
    storageBucket: "notulensimo.firebasestorage.app",
    messagingSenderId: "495140412805",
    appId: "1:495140412805:web:2747bc015695d0933d38ec",
    measurementId: "G-BWTFZ4WRRP"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const storageRef = storage.ref();

// Handle form submission for uploading PDF
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nomorMemo = document.getElementById('nomorMemo').value;
    const perihal = document.getElementById('perihal').value;
    const tanggal = document.getElementById('tanggal').value;
    const status = document.getElementById('status').value;
    const memoFile = document.getElementById('memoFile').files[0];

    if (!memoFile) {
        alert('Harap unggah file PDF');
        return;
    }

    const fileRef = storageRef.child('notulen_memo/' + memoFile.name);
    const uploadTask = fileRef.put(memoFile);

    uploadTask.on('state_changed', (snapshot) => {
        // Optional: show upload progress here
    }, (error) => {
        alert('Gagal mengunggah file: ' + error.message);
    }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // Tampilkan PDF setelah di-upload
            showPDFPreview(downloadURL);

            // Simpan data notulen di localStorage
            const notulen = {
                nomorMemo,
                perihal,
                tanggal,
                status,
                fileName: memoFile.name,
                fileURL: downloadURL
            };

            let notulenData = JSON.parse(localStorage.getItem('notulenData')) || [];
            notulenData.push(notulen);
            localStorage.setItem('notulenData', JSON.stringify(notulenData));

            // Reload the notulen list
            loadNotulenList();

            // Clear form after submission
            document.getElementById('uploadForm').reset();
        });
    });
});

// Function to display PDF preview
function showPDFPreview(downloadURL) {
    const iframe = document.getElementById('pdfPreview');
    const previewContainer = document.getElementById('previewContainer');

    iframe.src = downloadURL;
    previewContainer.style.display = 'block';
}

// Load the list of notulens
function loadNotulenList() {
    const notulenData = JSON.parse(localStorage.getItem('notulenData')) || [];
    const tableBody = document.getElementById('notulenTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear current list

    notulenData.forEach((notulen, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${notulen.nomorMemo}</td>
            <td>${notulen.perihal}</td>
            <td>${notulen.tanggal}</td>
            <td>${notulen.status}</td>
            <td><button onclick="viewNotulen(${index})">Lihat</button></td>
        `;
    });
}

// View PDF by opening it in a new tab
function viewNotulen(index) {
    const notulenData = JSON.parse(localStorage.getItem('notulenData')) || [];
    const notulen = notulenData[index];
    const fileURL = notulen.fileURL;

    if (fileURL) {
        window.open(fileURL, '_blank');
    } else {
        alert("PDF tidak ditemukan!");
    }
}

// Load the list of notulens when the page loads
loadNotulenList();
