// ฟังก์ชันสำหรับดึงจำนวนการแจ้งเตือนจาก API
async function fetchNotificationCount() {
    try {
        const creditorId = localStorage.getItem('id_shop'); // ดึง creditorId จาก localStorage

        if (!creditorId) {
            console.error('creditorId is required');
            return;
        }

        const response = await fetch(`/api/notifications/count?creditorId=${encodeURIComponent(creditorId)}`); // ส่ง creditorId ใน query parameters
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        updateNotificationCount(data.count); // อัปเดตจำนวนการแจ้งเตือน
    } catch (error) {
        console.error('Error fetching notification count:', error);
    }
}


// ฟังก์ชันสำหรับอัปเดตจำนวนการแจ้งเตือนใน DOM
function updateNotificationCount(count) {
    const notificationLink = document.querySelector('a[href="เเจ้งเตือน.html"]');
    if (notificationLink) {
        // ตั้งค่า data-count ให้เป็น 0 หรือจำนวนจริง
        notificationLink.setAttribute('data-count', count);

        // เพิ่มการตรวจสอบและอัปเดต CSS ตามจำนวน
        if (parseInt(count, 10) === 0) {
            notificationLink.classList.remove('active2'); // ลบคลาส active2 หากจำนวนเป็น 0
        } else {
            notificationLink.classList.add('active2'); // เพิ่มคลาส active2 หากมีการแจ้งเตือน
        }
    }
}

// เรียกใช้งานฟังก์ชันเพื่อดึงข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    fetchNotificationCount(); // เรียกใช้ฟังก์ชันเมื่อหน้าโหลดเสร็จ
});
