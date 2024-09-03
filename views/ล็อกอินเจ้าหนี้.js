document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // หยุดการส่งฟอร์มเพื่อทำการตรวจสอบ

    // ดึงข้อมูลจากฟอร์ม
    const formData = new FormData(event.target);
    const id = formData.get('id');
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('/loginn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, username, password })
        });

        if (response.ok) {
            // เก็บข้อมูลใน localStorage
            localStorage.setItem('id_shop', id);
            localStorage.setItem('shop_name', username);

            // ตรวจสอบข้อมูลที่เก็บใน localStorage
            console.log('Stored ID:', localStorage.getItem('id_shop'));
            console.log('Stored Shop Name:', localStorage.getItem('shop_name'));

            // เปลี่ยนเส้นทางไปยังหน้าข้อมูลลูกหนี้
            window.location.href = '/ข้อมูลลูกหนี้.html';
        } else {
            // รับข้อความผิดพลาดจากเซิร์ฟเวอร์และแสดงป๊อปอัพ
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
});
