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


document.addEventListener("DOMContentLoaded", function () {
    // เมื่อ DOM โหลดเสร็จสมบูรณ์
    var urlParams = new URLSearchParams(window.location.search);

    // ดึงค่าตามชื่อพารามิเตอร์ที่ต้องการ
    var idCardNumber = urlParams.get('id_card_number');
    var contractNumber = urlParams.get('contract_number');
    var billNumber = urlParams.get('bill_number');
    var principal = urlParams.get('principal');
    var loanId = urlParams.get('loan_id'); // ดึงค่า loan_id

    // ตรวจสอบค่าที่ดึงได้
    console.log("ID Card Number:", idCardNumber);
    console.log("Contract Number:", contractNumber);
    console.log("Bill Number:", billNumber);
    console.log("Principal:", principal);
    console.log("Loan ID:", loanId); // ตรวจสอบค่า loan_id

    // กำหนดค่าที่ดึงได้ในฟอร์ม
    if (idCardNumber) document.getElementById("id_card_number").value = idCardNumber;
    if (contractNumber) document.getElementById("contract_number").value = contractNumber;
    if (billNumber) document.getElementById("bill_number").value = billNumber;
    if (principal) document.getElementById("principal").value = principal;
    
    // กำหนดค่า loan_id ให้กับ input element "loan"
    document.getElementById('loan').value = loanId || '';

    // กำหนดค่าวันที่ให้กับ input element "seizureDate"
    setReturnDateInput();
});

// เรียกฟังก์ชัน setReturnDateInput เมื่อหน้าเว็บโหลด
function setReturnDateInput() {
    // สร้างวันที่ปัจจุบัน
    var today = new Date();

    // หากเดือนหรือวันเป็นเลขเดียว ให้เพิ่ม "0" ข้างหน้า
    var month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
    var day = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();

    // กำหนดค่าวันที่ให้กับ input element "seizureDate"
    document.getElementById('seizureDate').value = today.getFullYear() + '-' + month + '-' + day;
}

// คำนวณค่ารวมต้นทุนทรัพย์เมื่อมีการเปลี่ยนแปลงใน principal หรือ seizureCost
document.getElementById('principal').addEventListener('input', calculateTotalProperty);
document.getElementById('seizureCost').addEventListener('input', calculateTotalProperty);

function calculateTotalProperty() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const seizureCost = parseFloat(document.getElementById('seizureCost').value) || 0;
    const totalProperty = Math.round(principal + seizureCost); // ให้เปลี่ยนจาก toFixed(0) เป็น Math.round() เพื่อให้ได้ผลลัพธ์เป็นจำนวนเต็ม
    document.getElementById('totalproperty').value = totalProperty; // ปรับการกำหนดค่าที่นี่
}










// ประเภทและชื่อทรัพย์ที่ยึด
const assetOptions = {
    "อสังหาริมทรัพย์": ["บ้าน", "คอนโด", "ที่ดิน"],
    "รถยนต์": ["รถยนต์", "จักรยานยนต์", "รถบรรทุก"],
    "เครื่องใช้ไฟฟ้า": ["ตู้เย็น", "ทีวี", "เครื่องซักผ้า"]
  };
  
  // ฟังก์ชันสำหรับการโหลดตัวเลือกจาก Local Storage
  function loadOptionsFromStorage() {
    const storedOptions = JSON.parse(localStorage.getItem('assetOptions')) || assetOptions;
    Object.keys(storedOptions).forEach(type => {
      if (!assetOptions[type]) {
        assetOptions[type] = storedOptions[type];
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        document.getElementById("seizedAssetType").add(option);
      }
    });
  }
  
  // ฟังก์ชันสำหรับการบันทึกตัวเลือกใน Local Storage
  function saveOptionsToStorage() {
    localStorage.setItem('assetOptions', JSON.stringify(assetOptions));
  }
  
  function updateAssetNameOptions() {
    const seizedAssetType = document.getElementById("seizedAssetType").value;
    const assetNameSelect = document.getElementById("assetName");
  
    assetNameSelect.innerHTML = '<option value="">เลือกชื่อทรัพย์ที่ยึด</option>';
  
    if (seizedAssetType && assetOptions[seizedAssetType]) {
      assetOptions[seizedAssetType].forEach(option => {
        const newOption = document.createElement("option");
        newOption.value = option;
        newOption.text = option;
        assetNameSelect.add(newOption);
      });
    }
  }
  
  function addOption(selectId) {
    const selectElement = document.getElementById(selectId);
    const newOption = prompt("กรอกตัวเลือกใหม่:");
  
    if (newOption) {
      const option = document.createElement("option");
      option.value = newOption;
      option.text = newOption;
  
      if (selectId === "seizedAssetType") {
        selectElement.add(option);
        assetOptions[newOption] = [];
      } else {
        const selectedType = document.getElementById("seizedAssetType").value;
        if (selectedType) {
          selectElement.add(option);
          assetOptions[selectedType].push(newOption);
        } else {
          alert("กรุณาเลือกประเภททรัพย์ที่ยึดก่อนเพิ่มชื่อทรัพย์");
          return;
        }
      }
  
      // บันทึกตัวเลือกใหม่ใน Local Storage
      saveOptionsToStorage();
    }
  }
  
  function removeOption(selectId) {
    const selectElement = document.getElementById(selectId);
    const selectedOption = selectElement.value;
  
    if (!selectedOption) {
      alert("กรุณาเลือกตัวเลือกที่จะลบ");
      return;
    }
  
    // เพิ่มการยืนยันก่อนลบ
    const confirmDeletion = confirm(`คุณต้องการลบ "${selectedOption}" ใช่หรือไม่?`);
    if (!confirmDeletion) {
      return; // ยกเลิกการลบหากผู้ใช้ไม่ยืนยัน
    }
  
    if (selectId === "seizedAssetType") {
      // ลบประเภททรัพย์ที่ยึดและตัวเลือกที่เกี่ยวข้องทั้งหมด
      delete assetOptions[selectedOption];
      selectElement.remove(selectElement.selectedIndex);
  
      // ลบตัวเลือกชื่อทรัพย์ที่เกี่ยวข้องใน assetName
      updateAssetNameOptions();
    } else {
      // ลบชื่อทรัพย์ที่ยึดภายใต้ประเภทที่เลือก
      const selectedType = document.getElementById("seizedAssetType").value;
      if (selectedType && assetOptions[selectedType]) {
        const index = assetOptions[selectedType].indexOf(selectedOption);
        if (index > -1) {
          assetOptions[selectedType].splice(index, 1);
          selectElement.remove(selectElement.selectedIndex);
        }
      }
    }
  
    // บันทึกตัวเลือกใหม่ใน Local Storage
    saveOptionsToStorage();
  }
  
  // โหลดตัวเลือกเมื่อหน้าเว็บถูกโหลด
  window.onload = loadOptionsFromStorage;
  












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
document.getElementById('assetPhoto').addEventListener('change', handleFileSelect);
document.getElementById('seizureCost2').addEventListener('change', handleFileSelect);



document.getElementById('seizureForm').addEventListener('submit', function(event) {
    // อัปเดตข้อมูล Base64 ของไฟล์
    const assetPhoto = document.getElementById('assetPhoto').files[0];
    const seizureCost2 = document.getElementById('seizureCost2').files[0];

    if (assetPhoto) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('assetPhotoBase64').value = e.target.result;
        };
        reader.readAsDataURL(assetPhoto);
    }

    if (seizureCost2) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('seizureCost2Base64').value = e.target.result;
        };
        reader.readAsDataURL(seizureCost2);
    }
});




//เเสดงข้อมูลตามid
// ฟังก์ชันสำหรับการอัปเดตตัวเลือกชื่อทรัพย์
function updateAssetNameOptions() {
    const seizedAssetType = document.getElementById('seizedAssetType').value;
    const assetNameSelect = document.getElementById('assetName');
  
    // ล้างตัวเลือกปัจจุบัน
    assetNameSelect.innerHTML = '<option value="">เลือกชื่อทรัพย์ที่ยึด</option>';

    if (seizedAssetType && assetOptions[seizedAssetType]) {
        assetOptions[seizedAssetType].forEach(option => {
            const newOption = document.createElement("option");
            newOption.value = option;
            newOption.text = option;
            assetNameSelect.add(newOption);
        });
    }
}

// แสดงข้อมูลตาม id
document.addEventListener("DOMContentLoaded", async function() {
    // ดึงค่าพารามิเตอร์จาก URL
    const urlParams = new URLSearchParams(window.location.search);
    const seizureId = urlParams.get('seizure_id');

    if (seizureId) {
        try {
            // ดึงข้อมูลจาก API ตาม seizureId
            const response = await fetch(`/api/seize-assetss/${seizureId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const seizure = await response.json();

            // ตรวจสอบค่าที่ดึงมาและแสดงในฟอร์ม
            document.getElementById('id_card_number').value = seizure.id_card_number || '';
            document.getElementById('contract_number').value = seizure.contract_number || '';
            document.getElementById('bill_number').value = seizure.bill_number || '';
            document.getElementById('seizureDate').value = seizure.seizureDate || '';
            document.getElementById('collector_name').value = seizure.collector_name || '';
            document.getElementById('principal').value = seizure.principal || '';
            document.getElementById('seizureCost').value = seizure.seizureCost || '';
            document.getElementById('totalproperty').value = seizure.totalproperty || '';

            // ตั้งค่าตัวเลือกในฟิลด์ประเภททรัพย์
            const seizedAssetTypeSelect = document.getElementById('seizedAssetType');
            if (seizure.seizedAssetType && seizedAssetTypeSelect.querySelector(`option[value="${seizure.seizedAssetType}"]`)) {
                seizedAssetTypeSelect.value = seizure.seizedAssetType;
                updateAssetNameOptions(); // อัปเดตตัวเลือกชื่อทรัพย์ตามประเภทที่เลือก
            }

            // ตั้งค่าตัวเลือกชื่อทรัพย์
            const assetNameSelect = document.getElementById('assetName');
            if (seizure.assetName && assetNameSelect.querySelector(`option[value="${seizure.assetName}"]`)) {
                assetNameSelect.value = seizure.assetName;
            }

            // ตั้งค่ารายละเอียดของทรัพย์
            document.getElementById('assetDetails').value = seizure.assetDetails || '';

            // แสดงภาพตัวอย่างสำหรับรูปทรัพย์ที่ยึด
            if (seizure.assetPhoto && seizure.assetPhoto.length > 0) {
                const photoPreview = document.getElementById('assetPhoto_preview');
                const base64Image = seizure.assetPhoto[0].data; // ข้อมูล Base64 ของภาพ
                photoPreview.src = base64Image;
                photoPreview.style.display = 'block';
            } else {
                document.getElementById('assetPhoto_preview').style.display = 'none';
            }

            // แสดงภาพตัวอย่างสำหรับรูปสลิปค่ายึดทรัพย์
            if (seizure.seizureCost2 && seizure.seizureCost2.length > 0) {
                const costPreview = document.getElementById('seizureCost2_preview');
                const base64Image = seizure.seizureCost2[0].data; // ข้อมูล Base64 ของภาพ
                costPreview.src = base64Image;
                costPreview.style.display = 'block';
            } else {
                document.getElementById('seizureCost2_preview').style.display = 'none';
            }

            // ทำให้ฟิลด์ทั้งหมดเป็น readonly
            document.querySelectorAll('input, select, textarea').forEach(element => {
                element.setAttribute('readonly', 'readonly');
            });

            // ปิดการทำงานของปุ่มบันทึก
            document.getElementById('save_button').setAttribute('disabled', 'disabled');

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
        }
    } else {
        console.error('Seizure ID is missing');
    }
});

// โหลดตัวเลือกเมื่อหน้าเว็บถูกโหลด
window.onload = function() {
    loadOptionsFromStorage();
    // อัปเดตตัวเลือกชื่อทรัพย์ตามประเภทที่เลือก
    updateAssetNameOptions();
};


