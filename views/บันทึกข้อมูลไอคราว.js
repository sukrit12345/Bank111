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


function setReturnDateInput() {
    // สร้างวันที่ปัจจุบัน
    var today = new Date();

    // หากเดือนหรือวันเป็นเลขเดียว ให้เพิ่ม "0" ข้างหน้า
    var month = (today.getMonth() + 1).toString().padStart(2, '0');
    var day = today.getDate().toString().padStart(2, '0');

    // กำหนดค่าวันที่ให้กับ input element "record_date"
    document.getElementById('record_date').value = today.getFullYear() + '-' + month + '-' + day;
}

document.addEventListener('DOMContentLoaded', setReturnDateInput);




//ตรวจเบอร์โทรศัพท์
document.addEventListener("DOMContentLoaded", function() {
    var input = document.getElementById("phone_number");
    var errorMessage = document.getElementById("error_message");
    var form = document.getElementById("icloudForm");
    var submitButton = form.querySelector('input[type="submit"]');

    function validatePhoneNumber() {
        var value = input.value;

        // ตรวจสอบและแก้ไขค่าที่ป้อนในช่อง input
        if (/[^0-9]/.test(value) || value.length > 10) {
            // ถ้ามี ให้ตัดอักขระที่ไม่ใช่ตัวเลขออก
            input.value = value.replace(/[^0-9]/g, "").slice(0, 10);
        }

        // แสดงข้อความ "เบอร์โทรศัพท์ไม่ถูกต้อง" หากความยาวไม่ครบ 10 ตัวอักษร
        if (input.value.length === 10 || input.value.length === 0) {
            errorMessage.textContent = "";
            submitButton.disabled = false; // เปิดใช้งานปุ่ม submit
        } else {
            errorMessage.textContent = "เบอร์โทรศัพท์ไม่ถูกต้อง";
            submitButton.disabled = true; // ปิดการใช้งานปุ่ม submit
        }
    }

    // ตรวจสอบเบอร์โทรศัพท์เมื่อมีการป้อนค่า
    input.addEventListener("input", validatePhoneNumber);

    // ตรวจสอบเบอร์โทรศัพท์เมื่อฟอร์มถูกส่ง
    form.addEventListener("submit", function(event) {
        if (input.value.length !== 10 && input.value.length !== 0) {
            event.preventDefault(); // ป้องกันการส่งฟอร์มถ้าเบอร์โทรศัพท์ไม่ถูกต้อง
            errorMessage.textContent = "เบอร์โทรศัพท์ไม่ถูกต้อง";
        }
    });

    // ตรวจสอบเบอร์โทรศัพท์เมื่อโหลดหน้าเว็บ
    validatePhoneNumber();
});










//เเสดงข้อมูลไอคราวตามไอดี
document.addEventListener('DOMContentLoaded', async function() {
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const recordId = getQueryParam('_id');
    if (recordId) {
        try {
            const response = await fetch(`/api/icloudRecordd/${recordId}`);
            const record = await response.json();

            if (response.ok) {
                document.getElementById('record_id').value = record._id || ''; // กำหนด _id ในฟอร์ม
                document.getElementById('device_id').value = record.device_id || '';
                document.getElementById('phone_number').value = record.phone_number || '';
                document.getElementById('user_email').value = record.user_email || '';
                document.getElementById('email_password').value = record.email_password || '';
                document.getElementById('icloud_password').value = record.icloud_password || '';
                document.getElementById('loanCount').value = record.loanCount || '';
            } else {
                console.error('Failed to fetch record:', record.message);
            }
        } catch (error) {
            console.error('Failed to fetch record:', error);
        }
    }
});