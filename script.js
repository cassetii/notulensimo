// Inisialisasi Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Fungsi untuk meng-upload file PDF
function uploadFile(file) {
    const storageRef = ref(storage, 'files/' + file.name);
    uploadBytes(storageRef, file).then((snapshot) => {
        console.log('File berhasil di-upload!');
        getDownloadURL(snapshot.ref).then((downloadURL) => {
            saveMemoToFirestore(downloadURL);
        });
    }).catch((error) => {
        console.error('Error uploading file:', error);
    });
}

// Simpan data memo ke Firestore
function saveMemoToFirestore(pdfUrl) {
    const memoData = {
        nomorMemo: document.getElementById('nomorMemo').value,
        perihal: document.getElementById('perihal').value,
        tanggal: document.getElementById('tanggal').value,
        statusNotulen: document.getElementById('statusNotulen').value,
        pdfUrl: pdfUrl
    };

    addDoc(collection(db, "memos"), memoData).then(() => {
        document.getElementById('statusMessage').textContent = 'Memo berhasil disimpan!';
        displayMemos();  // Perbarui tampilan memo
    }).catch((error) => {
        console.error('Error adding document:', error);
        document.getElementById('statusMessage').textContent = 'Terjadi kesalahan saat menyimpan data.';
    });
}

// Tampilkan daftar memo dari Firestore
function displayMemos() {
    getDocs(collection(db, "memos")).then((querySnapshot) => {
        const memosContainer = document.getElementById('memosContainer');
        memosContainer.innerHTML = '';  // Clear previous memos
        querySnapshot.forEach((doc) => {
            const memo = doc.data();
            const memoItem = document.createElement('div');
            memoItem.classList.add('memo-item');
            memoItem.innerHTML = `
                <strong>Nomor Memo:</strong> ${memo.nomorMemo}
                <span><strong>Perihal:</strong> ${memo.perihal}</span>
                <span><strong>Tanggal:</strong> ${memo.tanggal}</span>
                <span><strong>Status:</strong> ${memo.statusNotulen}</span>
                <br>
                <button class="view" onclick="viewPdf('${memo.pdfUrl}')">Lihat Memo PDF</button>
                <button class="edit" onclick="editMemo('${doc.id}')">Edit</button>
                <button class="delete" onclick="deleteMemo('${doc.id}')">Hapus</button>
            `;
            memosContainer.appendChild(memoItem);
        });
    }).catch((error) => {
        console.error('Error getting documents:', error);
    });
}

// Fungsi untuk melihat PDF
function viewPdf(pdfUrl) {
    window.open(pdfUrl, '_blank');
}

// Fungsi untuk menghapus memo
function deleteMemo(memoId) {
    const memoRef = doc(db, "memos", memoId);
    deleteDoc(memoRef).then(() => {
        alert("Memo berhasil dihapus!");
        displayMemos();
    }).catch((error) => {
        console.error("Error deleting memo:", error);
    });
}

// Fungsi untuk mengedit memo
function editMemo(memoId) {
    // Implementasikan edit form sesuai kebutuhan Anda
    alert("Fitur edit belum diterapkan.");
}

// Event listener untuk form submit
document.getElementById('memoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const pdfFile = document.getElementById('pdfFile').files[0];
    if (pdfFile) {
        uploadFile(pdfFile);
    }
});

// Panggil fungsi untuk menampilkan memo setelah halaman dimuat
displayMemos();
