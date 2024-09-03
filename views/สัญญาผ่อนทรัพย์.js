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


//ส่งเลขบปชช ชื่อ นามสกุลไปหน้าบันทึกสัญญา
function redirectToContractPage() {
    // ดึงค่า id_card_number, fname, และ lname จาก URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const fname = urlParams.get('fname');
    const lname = urlParams.get('lname');
    const manager = urlParams.get('manager');
   


    if (idCardNumber && fname && lname && manager ) {
        // สร้าง URL ใหม่เพื่อไปยังหน้า "บันทึกสัญญา.html" โดยเพิ่มเฉพาะค่า id_card_number, fname, และ lname
        const newURL = `/เพิ่มสัญญาผ่อนทรัพย์.html?id_card_number=${encodeURIComponent(idCardNumber)}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&manager=${encodeURIComponent(manager)}`;
        // นำ URL ใหม่ไปที่หน้าที่ต้องการ
        window.location.href = newURL;
    } else {
        console.error('ส่งไม่สำเร็จ');
    }
}


//เเสดงข้อมูลเลขบปชช ชื่อ นามสกุล เมื่อกดปุ่มสัญญา
function redirectToContractPage2() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');


    // สร้าง URL ใหม่เพื่อไปยังหน้า "สัญญา.html" พร้อมกับส่งค่า id_card_number, fname, และ lname ไปด้วย
    const newURL = '/สัญญาผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
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
    const newURL = '/คืนเงินผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
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
    const newURL = '/ส่วนเเบ่งผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
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
    const newURL = '/กำไรขาดทุนผ่อนทรัพย์.html?id_card_number=' + encodeURIComponent(idCardNumber) +
                   '&fname=' + encodeURIComponent(firstName) +
                   '&lname=' + encodeURIComponent(lastName)+
                   '&manager=' + encodeURIComponent(manager);

    
    // นำ URL ใหม่ไปที่หน้าที่ต้องการ
    window.location.href = newURL;
}











async function displayLoanData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const idCardNumber = urlParams.get('id_card_number');
        const creditorId = localStorage.getItem('id_shop');

        if (!idCardNumber || !creditorId) {
            throw new Error('id_card_number and creditorId are required in URL');
        }

        const response = await fetch(`/api/loan-data?id_card_number=${idCardNumber}&creditorId=${creditorId}`);
        const data = await response.json();
        console.log(data);

        const tableBody = document.getElementById("loanData");
        tableBody.innerHTML = ''; // Clear table before adding new data

        data.forEach(loan => {
            const row = tableBody.insertRow(); // Add a new row to the beginning of tableBody
            row.id = `row-${loan._id}`; // Set id for the row

            // ตรวจสอบสถานะของ loan.status
            const isRefundDisabled = loan.status === "<span style='color: green;'>ต่อดอก</span>" || 
                                      loan.status === "<span style='color: green;'>ชำระครบ</span>";
            const isSeizeDisabled = loan.status === "<span style='color: red;'>ยึดทรัพย์</span>";

            const refundButtonText = isRefundDisabled ? "คืนแล้ว" : "คืนเงิน";
            const refundButtonState = isRefundDisabled || isSeizeDisabled ? 'disabled' : '';

            const seizeButtonText = isSeizeDisabled ? "ยึดแล้ว" : "ยึดทรัพย์";
            const seizeButtonState = isSeizeDisabled || isRefundDisabled ? 'disabled' : ''; // ปิดปุ่ม seizeAssets หากสถานะเป็น isRefundDisabled

            row.innerHTML = `
                <td>${loan.contract_number}</td>
                <td>${loan.bill_number}</td>
                <td>${loan.loanDate}</td>
                <td>${loan.loanPeriod} วัน</td>
                <td>${loan.returnDate}</td>
                <td>${loan.principal}</td>
                <td>${loan.interestRate}%</td>
                <td>${loan.totalInterest}</td>
                <td>${loan.totalInterest2}</td>
                <td>${loan.totalInterest3 !== undefined && loan.totalInterest3 !== null ? loan.totalInterest3 : 0}</td>
                <td>${loan.totalInterest4}</td>
                <td>${loan.totalRefund}</td>
                <td>${loan.totalRepayment === '-' ? loan.totalRepayment : loan.totalRepayment + ' วัน'}</td>
                <td>${loan.status}</td>
                <td>${loan.daysUntilReturn === '-' ? loan.daysUntilReturn : loan.daysUntilReturn + ' วัน'}</td>
                <td> 
                    <button onclick="redirectToEdit('${loan._id}', '${loan.id_card_number}', '${loan.fname}', '${loan.lname}', '${loan.manager}', '${loan.contract_number}', '${loan.bill_number}')"><i class="fas fa-pencil-alt"></i>แก้ไข</button>
                    <button onclick="redirectToDelete('${loan._id}', '${loan.id_card_number}')"><i class="fas fa-trash-alt"></i>ลบ</button>
                    <button onclick="redirectToclose('${loan._id}', '${loan.id_card_number}')"><i class="fas fa-ban"></i>ปิด</button>
                </td>
                <td><button onclick="seizeAssets('${loan._id}', '${loan.id_card_number}', '${loan.fname}', '${loan.lname}', '${loan.manager}', '${loan.contract_number}', '${loan.bill_number}', '${loan.principal}')" ${seizeButtonState}><i class="fas fa-lock"></i>${seizeButtonText}</button></td>
                <td><button onclick="refundMoney('${loan._id}', '${loan.id_card_number}', '${loan.fname}', '${loan.lname}', '${loan.manager}', '${loan.contract_number}', '${loan.bill_number}', '${loan.principal}', '${loan.totalInterest4}', '${loan.totalRefund}')" ${refundButtonState}><i class="fas fa-plus"></i>${refundButtonText}</button></td>
            `;
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
    }
}


window.onload = function () {
    displayLoanData();
};










// แก้ไขสัญญา
function redirectToEdit(loanId, idCardNumber, fname, lname, manager, contract_number, bill_number) {
    window.location.href = `/บันทึกสัญญา.html?loan_id=${encodeURIComponent(loanId)}&id_card_number=${encodeURIComponent(idCardNumber)}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&manager=${encodeURIComponent(manager)}&contract_number=${encodeURIComponent(contract_number)}&bill_number=${encodeURIComponent(bill_number)}`;
}



// ไปหน้าบันทึกยึดทรัพย์
function seizeAssets(loanId, idCardNumber, fname, lname, manager, contract_number, bill_number,principal) {
    window.location.href = `/บันทึกยึดทรัพย์.html?loan_id=${encodeURIComponent(loanId)}&id_card_number=${encodeURIComponent(idCardNumber)}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&manager=${encodeURIComponent(manager)}&contract_number=${encodeURIComponent(contract_number)}&bill_number=${encodeURIComponent(bill_number)}&principal=${encodeURIComponent(principal)}`;
}


// ไปหน้าบันทึกคืนเงิน
function refundMoney(loanId, idCardNumber, fname, lname, manager, contract_number, bill_number, principal, totalInterest4, totalRefund ) {
    window.location.href = `/บันทึกคืนเงิน.html?loan_id=${encodeURIComponent(loanId)}&id_card_number=${encodeURIComponent(idCardNumber)}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&manager=${encodeURIComponent(manager)}&contract_number=${encodeURIComponent(contract_number)}&bill_number=${encodeURIComponent(bill_number)}&principal=${encodeURIComponent(principal)}&totalInterest4=${encodeURIComponent(totalInterest4)}&totalRefund=${encodeURIComponent(totalRefund)}`;
}


// ลบข้อมูลสัญญา
function redirectToDelete(objectId, idCardNumber) {
    const confirmation = confirm(`คุณต้องการลบสัญญานี้หรือไม่?`);

    if (confirmation) {
        fetch(`/api/delete-loan/${objectId}?id_card_number=${idCardNumber}`, { // เพิ่ม id_card_number ใน URL
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete loan');
            }
            console.log('Loan deleted successfully');
            // ลบแถวที่มี ObjectId ออกจาก DOM
            const rowElement = document.getElementById(`row-${objectId}`);
            if (rowElement) {
                rowElement.remove();
            }
        })
        .catch(error => console.error('Error deleting loan:', error));
    }
}





//ปิดสัญญา
async function redirectToclose(loanId, idCardNumber) {
    const confirmation = confirm(`คุณต้องการปิดสัญญานี้หรือไม่?`);
    if (!confirmation) {
        return; // ถ้าผู้ใช้ยกเลิกการยืนยัน ให้หยุดฟังก์ชัน
    }

    try {
        const response = await fetch(`/api/close-loan/${loanId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idCardNumber }) // ส่ง idCardNumber ในรูปแบบ JSON
        });

        console.log(`Response status: ${response.status}`); // ตรวจสอบสถานะการตอบสนอง

        if (response.ok) {
            // อัปเดตสถานะใน Frontend
            const row = document.getElementById(`row-${loanId}`);
            if (row) {
                const statusCell = row.querySelector('td:nth-child(14)');
                if (statusCell) {
                    statusCell.innerHTML = "<span style='color: red;'>เเบล็คลิช</span>";
                    console.log('ปิดสัญญาสำเร็จ');
                }
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'ไม่สามารถปิดสัญญาได้');
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการปิดสัญญา:', error.message);
    }
}






















































//เปลี่ยนสีสถานะ
// ดึงตาราง HTML โดยใช้ ID
var table = document.getElementById("a");

// เลือกเซลล์ทั้งหมดที่อยู่ในคอลัมน์ที่ 12 และตรวจสอบว่ามีข้อความ "ชำระครบ" หรือไม่
var cells = document.querySelectorAll('#a td:nth-child(12)');
  
cells.forEach(function(cell) {
  var text = cell.innerHTML.trim();
  if (text === "อยู่ในสัญญา") {
    cell.classList.add('w');
  } 
  if (text === "เลยสัญญา") {
    cell.classList.add('l');
  } 
  if (text === "ครบสัญญา") {
    cell.classList.add('d');
  }
  if (text === "ต่อดอก") {
    cell.classList.add('s');
  } 
  if (text === "ชำระครบ") {
    cell.classList.add('s');
  } 
  if (text === "เเบล็คลิช") {
    cell.classList.add('b');
  } 
});














































