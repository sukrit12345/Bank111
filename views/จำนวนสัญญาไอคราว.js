//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');

    console.log('ID:', id);
    console.log('Shop Name:', shopName);

});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // ดึงค่า creditorId จาก localStorage
        const creditorId = localStorage.getItem('id_shop');

        // ดึงค่าพารามิเตอร์จาก URL
        const urlParams = new URLSearchParams(window.location.search);
        const phoneNumber = urlParams.get('phone_number');
        const userEmail = urlParams.get('user_email');

        // สร้าง URL สำหรับการเรียก API พร้อมพารามิเตอร์
        const apiUrl = new URL('/loan_with_icloud', window.location.origin);
        if (phoneNumber) apiUrl.searchParams.append('phone_number', phoneNumber);
        if (userEmail) apiUrl.searchParams.append('user_email', userEmail);
        if (creditorId) apiUrl.searchParams.append('creditorId', creditorId); // เพิ่ม creditorId เป็นพารามิเตอร์

        // เรียก API ด้วยพารามิเตอร์
        const response = await fetch(apiUrl);
        const records = await response.json();

        // จัดเรียงข้อมูลตามวันที่จากใหม่ไปเก่า
        records.sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));

        const tableBody = document.getElementById('recordsTableBody');
        const totalRecords = records.length;

        // วนลูปเพื่อสร้างแถวของตาราง
        records.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${totalRecords - index}</td> <!-- แสดง index จากมากไปน้อย -->
                <td>${record.loanDate || '-'}</td>
                <td>${record.manager || '-'}</td>
                <td>${record.id_card_number || '-'}</td>
                <td>${record.fname || '-'}</td>
                <td>${record.lname || '-'}</td>
                <td>${record.icloudAssets || '-'}</td> <!-- Display '-' if icloud_assets is empty or null -->
                <td><button class="delete-button" data-id="${record._id}">ลบ</button></td> <!-- เพิ่มปุ่มลบ -->
            `;
            tableBody.appendChild(row);
        });

        // เพิ่มเหตุการณ์คลิกสำหรับปุ่มลบ
        tableBody.addEventListener('click', handleDeleteClick);
    } catch (error) {
        console.error('Failed to fetch records:', error);
    }
});


// ฟังก์ชันจัดการการลบ
async function handleDeleteClick(event) {
    if (event.target.classList.contains('delete-button')) {
        const recordId = event.target.getAttribute('data-id');
        
        // ยืนยันการลบ
        const confirmation = confirm(`คุณต้องการลบiosที่เชื่อมกับไอคราวนี้หรือไม่?`);
        if (!confirmation) return; // หากผู้ใช้ยกเลิกการลบ, ออกจากฟังก์ชัน

        try {
            const deleteResponse = await fetch(`/delete_record2/${recordId}`, { method: 'DELETE' });
            if (deleteResponse.ok) {
                // รีเฟรชหน้าหลังจากลบเสร็จ
                location.reload();
            } else {
                console.error('Failed to delete record:', await deleteResponse.text());
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    }
}
