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

document.addEventListener("DOMContentLoaded", function() {
    // เมื่อ DOM โหลดเสร็จสมบูรณ์
    var urlParams = new URLSearchParams(window.location.search);

    // ดึงค่าตามชื่อพารามิเตอร์ที่ต้องการ และแปลงเป็นข้อความที่ถูกต้อง
    var idCardNumber = decodeURIComponent(urlParams.get('id_card_number'));
    var contractNumber = decodeURIComponent(urlParams.get('contract_number'));
    var billNumber = decodeURIComponent(urlParams.get('bill_number'));
    var totalProperty = decodeURIComponent(urlParams.get('totalproperty'));
    var assetName = decodeURIComponent(urlParams.get('assetName'));
    var assetDetails = decodeURIComponent(urlParams.get('assetDetails'));
    var seizureId = decodeURIComponent(urlParams.get('seizure_id'));

    // ตรวจสอบค่าที่ดึงได้
    console.log("ID Card Number:", idCardNumber);
    console.log("Contract Number:", contractNumber);
    console.log("Bill Number:", billNumber);
    console.log("Total Property:", totalProperty);
    console.log("Asset Name:", assetName);
    console.log("Asset Details:", assetDetails);
    console.log("Seizure ID:", seizureId); // ตรวจสอบ seizure_id

    // กำหนดค่าที่ดึงได้ในฟอร์ม
    document.getElementById("id_card_number").value = idCardNumber;
    document.getElementById("contract_number").value = contractNumber;
    document.getElementById("bill_number").value = billNumber;
    document.getElementById("totalproperty").value = totalProperty;
    document.getElementById("assetName").value = assetName;
    document.getElementById("assetDetails").value = assetDetails;
    document.getElementById("seizure_id").value = seizureId; // กำหนดค่า seizure_id

    // เพิ่ม event listener เพื่อคำนวณกำไรสุทธิ
    document.getElementById("sellamount").addEventListener("input", calculateNetProfit);
    document.getElementById("totalproperty").addEventListener("input", calculateNetProfit);
});


// ฟังก์ชันคำนวณกำไรสุทธิ
function calculateNetProfit() {
    var sellamount = parseFloat(document.getElementById("sellamount").value) || 0;
    var totalproperty = parseFloat(document.getElementById("totalproperty").value) || 0;
    var netprofit = sellamount - totalproperty;
    document.getElementById("netprofit").value = netprofit;
}

// ฟังก์ชันคำนวณกำไรสุทธิ
function calculateNetProfit() {
    var sellamount = parseFloat(document.getElementById("sellamount").value) || 0;
    var totalproperty = parseFloat(document.getElementById("totalproperty").value) || 0;
    var netprofit = sellamount - totalproperty;
    document.getElementById("netprofit").value = netprofit;
}





document.addEventListener('DOMContentLoaded', function() {
    setReturnDateInput();
});

function setReturnDateInput() {
    // สร้างวันที่ปัจจุบัน
    var today = new Date();

    // หากเดือนหรือวันเป็นเลขเดียว ให้เพิ่ม "0" ข้างหน้า
    var month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
    var day = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();

    // กำหนดค่าวันที่ให้กับ input element "sell_date"
    document.getElementById('sell_date').value = today.getFullYear() + '-' + month + '-' + day;
}

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

// เพิ่ม event listener ให้กับ input file
document.getElementById('sell_slip').addEventListener('change', handleFileSelect);





//เเสดงข้อมูลการขาย
window.onload = async function() {
    // ดึง id จาก URL พารามิเตอร์
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('_id');

    // รับปุ่ม submit
    const submitButton = document.getElementById('submit_button');

    // รับฟิลด์ทั้งหมดที่ต้องการทำให้เป็น readonly
    const fields = [
        'id_card_number',
        'contract_number',
        'bill_number',
        'totalproperty',
        'assetName',
        'assetDetails',
        'sell_date',
        'sellamount',
        'netprofit',
        'sell_slip_preview',
        'seizure_id'
    ];

    if (id) {
        try {
            // เรียก API เพื่อดึงข้อมูลการขายทรัพย์ตาม ID
            const response = await fetch(`/saless/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const sale = await response.json();

            // แสดงข้อมูลในฟอร์ม
            document.getElementById('id_card_number').value = sale.id_card_number || '';
            document.getElementById('contract_number').value = sale.contract_number || '';
            document.getElementById('bill_number').value = sale.bill_number || '';
            document.getElementById('totalproperty').value = sale.totalproperty || '';
            document.getElementById('assetName').value = sale.assetName || '';
            document.getElementById('assetDetails').value = sale.assetDetails || '';
            document.getElementById('sell_date').value = sale.sell_date || '';
            document.getElementById('sellamount').value = sale.sellamount || '';
            document.getElementById('netprofit').value = sale.netprofit || '';

            // แสดงรูปภาพสลิป
            const sellSlipPreview = document.getElementById('sell_slip_preview');
            if (sale.sell_slip && sale.sell_slip.length > 0) {
                const slip = sale.sell_slip[0];
                if (slip.data && slip.mimetype) {
                    sellSlipPreview.src = slip.data;
                    sellSlipPreview.style.display = 'block'; // แสดงรูปภาพ
                } else {
                    sellSlipPreview.style.display = 'none'; // ซ่อนรูปภาพถ้าไม่มีข้อมูล
                }
            } else {
                sellSlipPreview.style.display = 'none'; // ซ่อนรูปภาพถ้าไม่มีข้อมูล
            }

            document.getElementById('seizure_id').value = sale._id || ''; // เก็บ ID ของการยึดทรัพย์

            // ทำให้ฟิลด์ทั้งหมดเป็น readonly
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.setAttribute('readonly', 'readonly');
                }
            });

            // ปิดการทำงานของปุ่มบันทึก
            if (submitButton) {
                submitButton.setAttribute('disabled', 'disabled');
            }

        } catch (err) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
        }
    } else {
        // ถ้าไม่มี _id, ฟิลด์สามารถใช้งานได้และปุ่มก็สามารถทำงานได้
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.removeAttribute('readonly');
            }
        });

        if (submitButton) {
            submitButton.removeAttribute('disabled');
        }
    }
};




