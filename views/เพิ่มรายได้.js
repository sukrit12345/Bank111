//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    // ดึงค่า ID จาก localStorage
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');
    
    // ใส่ค่า ID ลงในฟิลด์ input ที่มี id เป็น 'creditor'
    if (id) {
        document.getElementById('creditorId').value = id;
    }

    // แสดงค่า ID ในคอนโซลสำหรับการดีบัก
    console.log('ID:', id);
    console.log('Shop Name:', shopName);
    console.log('Creditor Value:', document.getElementById('creditorId').value); // ตรวจสอบค่าที่ตั้งใน input
});

function setrecord_date() {
    // สร้างวันที่ปัจจุบัน
    var today = new Date();

    // หากเดือนหรือวันเป็นเลขเดียว ให้เพิ่ม "0" ข้างหน้า
    var month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
    var day = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();

    // กำหนดค่าวันที่ให้กับ input element "record_date"
    var dateString = today.getFullYear() + '-' + month + '-' + day;
    document.getElementById('record_date').value = dateString;
}

// เรียกใช้ฟังก์ชันเมื่อหน้าเว็บโหลดเสร็จ
setrecord_date();



// เเสดงไฟล์ภาพที่กำลังบันทึก
function handleFileSelect(event) {
    const input = event.target;
    const file = input.files[0];
    const preview = document.getElementById(input.id + '_preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; // แสดงภาพ
        };
        reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
    } else {
        preview.src = '';
        preview.style.display = 'none'; // ซ่อนภาพ
    }
}

// เพิ่ม event listener ให้กับ input file
document.getElementById('income_receipt').addEventListener('change', handleFileSelect);






// ฟังก์ชันเพื่อดึงพารามิเตอร์จาก URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ดึงข้อมูลตามไอดีจาก API และแสดงในฟอร์ม
document.addEventListener('DOMContentLoaded', () => {
    const id = getQueryParam('id');
    if (id) {
        fetch(`/api/get-income5/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    document.getElementById('record_date').value = data.record_date;
                    document.getElementById('income_amount').value = data.income_amount;
                    document.getElementById('details').value = data.details;

                    const imagePreview = document.getElementById('income_receipt_preview');
                    if (data.income_receipt_path && data.income_receipt_path.length > 0) {
                        const file = data.income_receipt_path[0]; // ใช้ไฟล์แรกที่พบในอาร์เรย์
                        const imageUrl = `data:${file.mimetype};base64,${file.data}`;
                        imagePreview.style.display = 'block';
                        imagePreview.src = imageUrl;
                    } else {
                        imagePreview.style.display = 'none'; // ซ่อนรูปถ้าข้อมูลไม่มี
                    }

                    // ทำให้ฟิลด์ทั้งหมดเป็น readonly ถ้ามีพารามิเตอร์ id
                    document.querySelectorAll('input, textarea').forEach(element => {
                        element.setAttribute('readonly', 'readonly');
                    });

                    // ปิดการใช้งานปุ่มส่งข้อมูลถ้ามีพารามิเตอร์ id
                    const submitButton = document.getElementById('save_button');
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});




