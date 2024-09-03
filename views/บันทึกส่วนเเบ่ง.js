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


document.addEventListener("DOMContentLoaded", async function() {
    // ดึงค่าจาก URL query string
    const urlParams = new URLSearchParams(window.location.search);

    // ดึงค่าตามชื่อพารามิเตอร์ที่ต้องการ
    const refundId = urlParams.get('refundId');
    const idCardNumber = urlParams.get('id_card_number');
    const firstName = urlParams.get('fname');
    const lastName = urlParams.get('lname');
    const manager = urlParams.get('manager');
    const contractNumber = urlParams.get('contract_number');
    const billNumber = urlParams.get('bill_number');
    const initial_profit = urlParams.get('initial_profit');

    // ตรวจสอบค่าที่ดึงได้
    console.log("Refund ID:", refundId);
    console.log("ID Card Number:", idCardNumber);
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Manager:", manager);
    console.log("Contract Number:", contractNumber);
    console.log("Bill Number:", billNumber);
    console.log("initial_profit:", initial_profit);

    // ใช้ค่าที่ดึงได้ในการปรับแต่งหรือใช้งานต่อไป
    document.getElementById("initial_profit").value = initial_profit || '';
    document.getElementById("id_card_number").value = idCardNumber || '';
    document.getElementById("fname").value = firstName || '';
    document.getElementById("lname").value = lastName || '';
    document.getElementById("manager").value = manager || '';
    document.getElementById("contract_number").value = contractNumber || '';
    document.getElementById("bill_number").value = billNumber || '';
    document.getElementById("refundId").value = refundId || ''; // อัปเดตตรงนี้
    document.getElementById("manager_name").value = manager || '';

    // ค้นหาข้อมูลจากฐานข้อมูล Manager
    const managerData = await Manager.findOne({ nickname: manager });

    if (managerData) {
        console.log("Manager Data:", managerData);
        document.getElementById("bankName").value = managerData.bankName || '';
        document.getElementById("accountNumber").value = managerData.accountNumber || '';
    } else {
        console.log('Manager not found!');
        // Clear bankName and accountNumber if manager data is not found
        document.getElementById("bankName").value = '';
        document.getElementById("accountNumber").value = '';
    }
});




//วันที่ปัจจุบัน
window.onload = setDate;



function setDate() {
    // Create current date
    var today = new Date();

    // Format month and day to have leading zero if needed
    var month = (today.getMonth() + 1).toString().padStart(2, '0');
    var day = today.getDate().toString().padStart(2, '0');

    // Set the value of the date input field
    document.getElementById('return_date_input').value = today.getFullYear() + '-' + month + '-' + day;
}

function calculateShares() {
    // Get the input values
    const initialProfit = parseFloat(document.getElementById('initial_profit').value) || 0;
    const collectorSharePercent = parseFloat(document.getElementById('collector_share_percent').value) || 0;
    const managerSharePercent = parseFloat(document.getElementById('manager_share2').value) || 0;
    const receiverSharePercent = parseFloat(document.getElementById('receiver_share_percent').value) || 0;
    
    // Get direct inputs for shares
    const collectorShareInput = parseFloat(document.getElementById('collector_share').value) || 0;
    const managerShareInput = parseFloat(document.getElementById('manager_share').value) || 0;
    const receiverShareInput = parseFloat(document.getElementById('receiver_share').value) || 0;

    // Calculate collector share if not set directly
    let collectorShare = collectorShareInput;
    if (collectorShare === 0) {
        collectorShare = (initialProfit * collectorSharePercent) / 100;
    }

    const initialProfit2 = initialProfit - Math.abs(collectorShare);

    // Calculate manager share if not set directly
    let managerShare = managerShareInput;
    if (managerShare === 0) {
        managerShare = (initialProfit2 * managerSharePercent) / 100;
    }

    // Calculate receiver profit and share if not set directly
    const receiverProfit = initialProfit2 - managerShare;
    let receiverShare = receiverShareInput;
    if (receiverShare === 0) {
        receiverShare = (receiverProfit * receiverSharePercent) / 100;
    }

    // Calculate total share and net profit
    const totalShare = Math.abs(collectorShare) + Math.abs(managerShare) + Math.abs(receiverShare);
    const netProfit = initialProfit - Math.abs(totalShare);

    // Set the calculated values
    document.getElementById('collector_share').value = collectorShare.toFixed(0);
    document.getElementById('initial_profit2').value = initialProfit2.toFixed(0);
    document.getElementById('manager_share').value = managerShare.toFixed(0);
    document.getElementById('receiver_profit').value = receiverProfit.toFixed(0);
    document.getElementById('receiver_share').value = receiverShare.toFixed(0);
    document.getElementById('total_share').value = totalShare.toFixed(0);
    document.getElementById('net_profit').value = netProfit.toFixed(0);
}

// Call calculateShares() initially and on input change events
document.addEventListener('DOMContentLoaded', (event) => {
    setDate();
    calculateShares(); // Initial calculation
    document.getElementById('initial_profit').addEventListener('input', calculateShares);
    document.getElementById('collector_share_percent').addEventListener('input', calculateShares);
    document.getElementById('manager_share2').addEventListener('input', calculateShares);
    document.getElementById('receiver_share_percent').addEventListener('input', calculateShares);
    document.getElementById('collector_share').addEventListener('input', calculateShares);
    document.getElementById('manager_share').addEventListener('input', calculateShares);
    document.getElementById('receiver_share').addEventListener('input', calculateShares);
});







//เลือกชื่อเเอดมินรับเงิน
document.addEventListener('DOMContentLoaded', function() {
    const creditorId = localStorage.getItem('id_shop'); // ดึง creditorId จาก localStorage

    if (!creditorId) {
        console.error('creditorId is not defined');
        return;
    }

    fetch(`/api/receiver_name?creditorId=${creditorId}`) // ส่ง creditorId ไปยัง API
      .then(response => response.json())
      .then(data => {
        const receiver_nameSelect = document.getElementById('receiver_name');
        data.forEach(receiver_name => {
          const option = document.createElement('option');
          option.value = receiver_name.nickname;
          option.textContent = receiver_name.nickname;
          receiver_nameSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Error:', error));
});





//เเสดงไฟล์ภาพที่กำลังบันทึก
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

// เพิ่ม event listeners ให้กับ input file
document.getElementById('receiver_receipt_photo').addEventListener('change', handleFileSelect);
document.getElementById('manager_receipt_photo').addEventListener('change', handleFileSelect);
document.getElementById('collector_receipt_photo').addEventListener('change', handleFileSelect);






//เเสดงข้อมูลส่วนเเบ่งตามid
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('_id'); // เปลี่ยนเป็น _id

    if (id) {
        try {
            const response = await fetch(`/api/profitsharingss/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const profitSharing = await response.json();

            // เติมข้อมูลในฟอร์ม
            document.getElementById('manager').value = profitSharing.manager || '';
            document.getElementById('id_card_number').value = profitSharing.id_card_number || '';
            document.getElementById('fname').value = profitSharing.fname || '';
            document.getElementById('lname').value = profitSharing.lname || '';
            document.getElementById('contract_number').value = profitSharing.contract_number || '';
            document.getElementById('bill_number').value = profitSharing.bill_number || '';

            // ข้อมูลการแบ่งเงินคนทวง
            document.getElementById('return_date_input').value = profitSharing.returnDate;
            document.getElementById('initial_profit').value = profitSharing.initialProfit || '';
            document.getElementById('collector_name').value = profitSharing.collectorName || '';
            document.getElementById('collector_share_percent').value = profitSharing.collectorSharePercent || '';
            document.getElementById('collector_share').value = profitSharing.collectorShare || '';

            // แสดงภาพถ่ายสลิปคนทวงถ้ามี
            const collectorReceiptPreview = document.getElementById('collector_receipt_photo_preview');
            if (profitSharing.collectorReceiptPhoto && profitSharing.collectorReceiptPhoto.length > 0) {
                const file = profitSharing.collectorReceiptPhoto[0];
                const imageUrl = `data:${file.mimetype};base64,${file.data}`;
                collectorReceiptPreview.style.display = 'block';
                collectorReceiptPreview.src = imageUrl;
            } else {
                collectorReceiptPreview.style.display = 'none';
            }

            // ข้อมูลการแบ่งเงินแอดมินดูแล
            document.getElementById('initial_profit2').value = profitSharing.initialProfit2 || '';
            document.getElementById('manager_name').value = profitSharing.managerName || '';
            document.getElementById('manager_share2').value = profitSharing.managerShare2 || '';
            document.getElementById('manager_share').value = profitSharing.managerShare || '';

            // แสดงภาพถ่ายสลิปแอดมินดูแลถ้ามี
            const managerReceiptPreview = document.getElementById('manager_receipt_photo_preview');
            if (profitSharing.managerReceiptPhoto && profitSharing.managerReceiptPhoto.length > 0) {
                const file = profitSharing.managerReceiptPhoto[0];
                const imageUrl = `data:${file.mimetype};base64,${file.data}`;
                managerReceiptPreview.style.display = 'block';
                managerReceiptPreview.src = imageUrl;
            } else {
                managerReceiptPreview.style.display = 'none';
            }

            // ข้อมูลการแบ่งเงินแอดมินรับเงิน
            document.getElementById('receiver_profit').value = profitSharing.receiverProfit || '';
            document.getElementById('receiver_name').value = profitSharing.receiverName || '';
            document.getElementById('receiver_share_percent').value = profitSharing.receiverSharePercent || '';
            document.getElementById('receiver_share').value = profitSharing.receiverShare || '';

            // แสดงภาพถ่ายสลิปแอดมินรับเงินถ้ามี
            const receiverReceiptPreview = document.getElementById('receiver_receipt_photo_preview');
            if (profitSharing.receiverReceiptPhoto && profitSharing.receiverReceiptPhoto.length > 0) {
                const file = profitSharing.receiverReceiptPhoto[0];
                const imageUrl = `data:${file.mimetype};base64,${file.data}`;
                receiverReceiptPreview.style.display = 'block';
                receiverReceiptPreview.src = imageUrl;
            } else {
                receiverReceiptPreview.style.display = 'none';
            }

            // ข้อมูลกำไรสุทธิ
            document.getElementById('total_share').value = profitSharing.totalShare || '';
            document.getElementById('net_profit').value = profitSharing.netProfit || '';

            // ทำให้ฟิลด์ทั้งหมดเป็น readonly
            document.querySelectorAll('input, select, textarea').forEach(element => {
                element.setAttribute('readonly', 'readonly');
            });

            // ปิดการทำงานของปุ่มบันทึก
            document.querySelector('input[type="submit"]').setAttribute('disabled', 'disabled');

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        }
    }
});


