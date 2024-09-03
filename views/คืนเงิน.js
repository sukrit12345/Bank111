//ไอดีร้าน
document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('id_shop');
    const shopName = localStorage.getItem('shop_name');

    console.log('ID:', id);
    console.log('Shop Name:', shopName);

});

//รับข้อมูล เลขบปชช ชื่อ นามสกุล
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);

    // ดึงค่า id_card_number และแสดงใน HTML
    const idCardNumber = urlParams.get('id_card_number');
    document.getElementById('id-card-number').textContent = idCardNumber ? idCardNumber : "N/A";

    // ดึงค่า fname และแสดงใน HTML
    const firstName = urlParams.get('fname');
    document.getElementById('first-name').textContent = firstName ? firstName : "N/A";

    // ดึงค่า lname และแสดงใน HTML
    const lastName = urlParams.get('lname');
    document.getElementById('last-name').textContent = lastName ? lastName : "N/A";

    // ดึงค่า manager และแสดงใน HTML
    const manager = urlParams.get('manager');
    document.getElementById('manager').textContent = manager ? manager : "N/A";


});



//เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มสัญญา
function redirectToContractPage2() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');


    // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
    const newURL = '/สัญญา.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                   '&fname=' + encodeURIComponent(firstName) +
                   '&lname=' + encodeURIComponent(lastName)+
                   '&manager=' + encodeURIComponent(manager);

    
    // นำ URL ใหม่ไปที่หน้าที่ต้องการ
    window.location.href = newURL;
}



//เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มคืนเงิน
function redirectToContractPage3() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');


    // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
    const newURL = '/คืนเงิน.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                   '&fname=' + encodeURIComponent(firstName) +
                   '&lname=' + encodeURIComponent(lastName)+
                   '&manager=' + encodeURIComponent(manager);

    
    // นำ URL ใหม่ไปที่หน้าที่ต้องการ
    window.location.href = newURL;
}



//เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มส่วนเเบ่ง
function redirectToContractPage4() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');


    // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
    const newURL = '/ส่วนเเบ่ง.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                   '&fname=' + encodeURIComponent(firstName) +
                   '&lname=' + encodeURIComponent(lastName)+
                   '&manager=' + encodeURIComponent(manager);

    
    // นำ URL ใหม่ไปที่หน้าที่ต้องการ
    window.location.href = newURL;
}


//เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มกำไร/ขาดทุน
function redirectToContractPage5() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');


    // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
    const newURL = '/กำไรขาดทุน.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                   '&fname=' + encodeURIComponent(firstName) +
                   '&lname=' + encodeURIComponent(lastName)+
                   '&manager=' + encodeURIComponent(manager);

    
    // นำ URL ใหม่ไปที่หน้าที่ต้องการ
    window.location.href = newURL;
}





document.addEventListener("DOMContentLoaded", async function() {
    try {
        // ดึงค่าพารามิเตอร์จาก URL
        const urlParams = new URLSearchParams(window.location.search);
        const idCardNumber = urlParams.get('id_card_number');
        const creditorId = localStorage.getItem('id_shop'); // ดึง creditorId จาก localStorage

        if (!idCardNumber || !creditorId) {
            throw new Error('id_card_number or creditorId is missing');
        }

        // ดึงข้อมูลคืนเงินจาก API โดยส่ง idCardNumber และ creditorId
        const response = await fetch(`/api/refunds?id_card_number=${idCardNumber}&creditorId=${creditorId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const refunds = await response.json();

        // ตรวจสอบข้อมูลที่ได้รับ
        console.log('Refunds data:', refunds);

        const refundData = document.getElementById('refundData');
        refundData.innerHTML = ''; // ล้างข้อมูลเก่า

        refunds.forEach(refund => {
            const row = document.createElement('tr');

            // ตรวจสอบสถานะ ถ้าเป็น "<span style=\"color: green;\">เเบ่งเเล้ว</span>" ให้ทำการ disable ปุ่มส่วนแบ่ง
            const isDivided = refund.status === "<span style=\"color: green;\">เเบ่งเเล้ว</span>";
            const dividedButton = isDivided
                ? '<button disabled>แบ่งแล้ว</button>'
                : `<button onclick="divided(
                     '${refund._id}',
                     '${refund.id_card_number}',
                     '${refund.lname}',
                     '${refund.fname}',
                     '${refund.manager}',
                     '${refund.contract_number}',
                     '${refund.bill_number}',
                     '${refund.initial_profit}'
                   )"><i class="fas fa-plus"></i>ส่วนแบ่ง</button>`;

            row.innerHTML = `
                <td>${refund.contract_number}</td>
                <td>${refund.bill_number}</td> 
                <td>${refund.principal}</td> 
                <td>${refund.totalInterest4}</td>
                <td>${refund.totalRefund}</td>
                <td>${refund.return_date}</td>
                <td>${refund.refund_principal}</td>
                <td>${refund.refund_interest}</td>
                <td>${refund.debtAmount}</td>
                <td>${refund.total_refund2}</td>
                <td>${refund.totalInterest5}</td>
                <td>${refund.initial_profit}</td>
                <td>${refund.status}</td> 
                <td>
                   <button onclick="viewRefund('${refund._id}', '${refund.loan ? refund.loan._id : ''}')"><i class="fas fa-eye"></i>ดู</button>
                   <button onclick="deleteRefund('${refund._id}')"><i class="fas fa-trash-alt"></i>ลบ</button>
                </td>
                <td>
                   ${dividedButton}
                </td>
            `;

            refundData.appendChild(row);
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
    }
});








//ดู
function viewRefund(refundId, loanId) {
    console.log('Viewing with refundId:', refundId, 'and loanId:', loanId);
    // ตรวจสอบให้แน่ใจว่า loanId เป็น string และไม่ใช่ออบเจ็กต์
    if (typeof loanId === 'object') {
        loanId = loanId._id;
    }
    window.location.href = `/บันทึกคืนเงิน.html?_id=${encodeURIComponent(refundId)}&loan_id=${encodeURIComponent(loanId)}`;
}










// ลบข้อมูลคืนเงิน
function deleteRefund(refundId) {
    const confirmation = confirm(`คุณต้องการลบการคืนเงินนี้หรือไม่?`);
    if (confirmation) {
        // ส่งคำขอ DELETE ไปยังเซิร์ฟเวอร์
        fetch(`/api/refunds/${refundId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
                // รีโหลดหน้าหลังจากลบสำเร็จ
                window.location.reload();
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error.message);
                // แสดงข้อความแจ้งเตือนถ้ามีข้อผิดพลาด
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            });
    }
}





function divided(refundId, idCardNumber, firstName, lastName, manager, contractNumber, billNumber, initial_profit) {
    // ทำการ redirect ไปยังหน้าบันทึกส่วนแบ่ง พร้อมส่งค่าผ่าน URL query string
    const queryString = `?refundId=${refundId}&id_card_number=${idCardNumber}&fname=${firstName}&lname=${lastName}&manager=${manager}&contract_number=${contractNumber}&bill_number=${billNumber}&initial_profit=${initial_profit}`;
    window.location.href = `/บันทึกส่วนเเบ่ง.html${queryString}`;
}



