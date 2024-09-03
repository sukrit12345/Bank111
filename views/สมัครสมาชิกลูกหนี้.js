document.querySelector('.signup-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // หยุดการส่งฟอร์มเพื่อทำการตรวจสอบ
    
    const id_card_number = document.getElementById('id_card_number').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    
    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
    if (password !== password2) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
    }

    // ตรวจสอบเลขบัตรประชาชนให้เป็นตัวเลข 13 หลัก
    if (!/^\d{13}$/.test(id_card_number)) {
        alert('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
        return;
    }

    // ตรวจสอบเบอร์โทรศัพท์ให้เป็นตัวเลข 10 หลัก
    if (!/^\d{10}$/.test(phone)) {
        alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
        return;
    }
    
    // ส่งข้อมูลฟอร์มไปยังเซิร์ฟเวอร์
    try {
        const response = await fetch('/signup2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_card_number, email, phone, password, password2 })
        });

        if (response.ok) {
            window.location.href = '/ล็อกอินลูกหนี้.html'; // เปลี่ยนไปยังหน้าเข้าสู่ระบบ
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
});
