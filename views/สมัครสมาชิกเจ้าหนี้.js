document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // หยุดการส่งฟอร์มเพื่อทำการตรวจสอบ
    
    const id = document.getElementById('id').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    
    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
    if (password1 !== password2) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
    }

    // ตรวจสอบไอดีร้านให้เป็นตัวเลข 10 หลัก
    if (!/^\d{10}$/.test(id)) {
        alert('ไอดีร้านต้องเป็นตัวเลข 10 หลัก');
        return;
    }

    // ตรวจสอบเบอร์โทรศัพท์ให้เป็นตัวเลข 10 หลัก
    if (!/^\d{10}$/.test(phone)) {
        alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
        return;
    }
    
    // ส่งข้อมูลฟอร์มไปยังเซิร์ฟเวอร์
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, username, email, phone, password1, password2 })
        });

        if (response.ok) {
            window.location.href = '/ล็อกอินเจ้าหนี้.html'; // เปลี่ยนไปยังหน้าเข้าสู่ระบบ
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
});
