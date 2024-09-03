document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // หยุดการส่งฟอร์มเพื่อทำการตรวจสอบ

    // ดึงข้อมูลจากฟอร์ม
    const formData = new FormData(event.target);
    const id = formData.get('id');
    const username = formData.get('username');
    const password = formData.get('password');

    // ส่งข้อมูลฟอร์มไปยังเซิร์ฟเวอร์
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, username, password })
        });

        if (response.ok) {
            // ใช้ URL ของหน้าหลักลูกหนี้.html ในการเปลี่ยนเส้นทาง
            window.location.href = `/หน้าหลักลูกหนี้.html?id=${id}&id_card_number=${username}`;
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
});
