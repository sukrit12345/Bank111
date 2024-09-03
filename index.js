const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const multer = require('multer');
const cors = require('cors');
const { DebtorInformation, LoanInformation, Refund, ProfitSharing, Manager, Seizure, Sale, iCloudRecord, Income, Expense, Capital, File, Creditor, User } = require('./models'); // Assuming you saved the schema in 'models.js'

// กำหนดการใช้งาน bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs'); // สำหรับใช้งาน EJS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ใช้ memoryStorage แทน diskStorage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ฟังก์ชันสำหรับแปลงไฟล์เป็น Base64
function encodeFileToBase64(fileBuffer, mimetype) {
    return `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
}

// ฟังก์ชันสำหรับบันทึกไฟล์ลงฐานข้อมูล
async function saveFile(file) {
    const encodedFile = encodeFileToBase64(file.buffer, file.mimetype);
    const newFile = new File({
        filename: file.originalname,
        data: encodedFile,
        mimetype: file.mimetype
    });
    return await newFile.save();
}


const transformFileToBase64 = async (fileArray) => {
    if (!fileArray || fileArray.length === 0) return null;
    const file = fileArray[0];
    return `data:${file.contentType};base64,${file.data.toString('base64')}`;
};



// เปิดไฟล์หน้าเเรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ล็อกอินลูกหนี้.html'));
});   



//สมัครเจ้าหนี้
app.post('/signup', async (req, res) => {
    try {
        const { id, username, email, phone, password1, password2 } = req.body;

        // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกัน
        if (password1 !== password2) {
            return res.status(400).send('รหัสผ่านไม่ตรงกัน');
        }

        // สร้างผู้ใช้ใหม่
        const newCreditor = new Creditor({
            id,
            username,
            email,
            phone,
            password: password1 // บันทึกรหัสผ่านตรงๆ
        });

        // ตรวจสอบการมีอยู่ของ ID หรืออีเมล
        const existingCreditor = await Creditor.findOne({ $or: [{ id }, { email }] });
        if (existingCreditor) {
            return res.status(400).send('ไอดีร้านหรืออีเมลนี้ถูกใช้ไปแล้ว');
        }

        // บันทึกผู้ใช้ใหม่
        await newCreditor.save();

        res.redirect('/ล็อกอินเจ้าหนี้.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
});

// เข้าสู่ระบบเจ้าหนี้
app.post('/loginn', async (req, res) => {
    try {
        const { id, username, password } = req.body;

        // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
        const creditor = await Creditor.findOne({ id, username });

        if (creditor) {
            // ตรวจสอบรหัสผ่านของเจ้าหนี้
            if (creditor.password === password) {
                // ล็อกอินสำเร็จ ส่งผู้ใช้ไปยังหน้าหลักเจ้าหนี้.html พร้อมกับ id และ username
                return res.redirect(`/ข้อมูลลูกหนี้.html?id=${id}&shop_name=${username}`);
            } else {
                return res.status(400).send('รหัสผ่านไม่ถูกต้อง');
            }
        }

        // ถ้าไม่เจอข้อมูลในฐานข้อมูล
        return res.status(400).send('ไม่พบผู้ใช้งาน');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
});


//สมัครลูกหนี้
app.post('/signup2', async (req, res) => {
    try {
        // รับข้อมูลจากฟอร์ม
        const { id_card_number, email, phone, password, password2 } = req.body;

        // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
        if (password !== password2) {
            return res.status(400).send('รหัสผ่านไม่ตรงกัน');
        }

        // ตรวจสอบว่าผู้ใช้งานที่มี id_card_number นี้มีอยู่แล้วหรือไม่
        const existingUser = await User.findOne({ id_card_number });
        if (existingUser) {
            return res.status(400).send('มีผู้ใช้งานที่มีเลขบัตรประชาชนนี้แล้ว');
        }

        // สร้างผู้ใช้งานใหม่
        const newUser = new User({
            id_card_number,
            email,
            phone,
            password // บันทึกรหัสผ่านเป็นข้อความธรรมดา
        });

        // บันทึกข้อมูลลงในฐานข้อมูล
        await newUser.save();

        // ส่งการตอบสนองกลับไปยังลูกค้า (เช่น ส่งไปยังหน้าล็อกอิน)
        res.redirect('/ล็อกอินลูกหนี้.html'); // เปลี่ยนเส้นทางไปยังหน้าล็อกอินหลังจากสมัครสมาชิกสำเร็จ
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
});

//เข้าสู่ระบบลูกหนี้
app.post('/login', async (req, res) => {
    try {
        const { id, username, password } = req.body;

        // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูล creditor หรือไม่
        const creditor = await Creditor.findOne({ id, username });

        if (creditor) {
            // ตรวจสอบรหัสผ่านของ creditor
            if (creditor.password === password) {
                // ล็อกอินสำเร็จ ส่งผู้ใช้ไปยังหน้าหลักลูกหนี้.html พร้อมกับ id และ id_card_number
                return res.redirect(`/หน้าหลักลูกหนี้.html?id=${id}&id_card_number=${username}`);
            } else {
                return res.status(400).send('รหัสผ่านไม่ถูกต้อง');
            }
        }

        // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูล user หรือไม่
        const user = await User.findOne({ id_card_number: username });

        if (user) {
            // ตรวจสอบรหัสผ่านของ user
            if (user.password === password) {
                // ล็อกอินสำเร็จ ส่งผู้ใช้ไปยังหน้าหลักลูกหนี้.html พร้อมกับ id และ id_card_number
                return res.redirect(`/หน้าหลักลูกหนี้.html?id=${id}&id_card_number=${username}`);
            } else {
                return res.status(400).send('รหัสผ่านไม่ถูกต้อง');
            }
        }

        // ถ้าไม่เจอข้อมูลทั้งใน creditor และ user
        return res.status(400).send('ไม่พบผู้ใช้งาน');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
});







// บันทึกข้อมูลลูกหนี้
app.post('/Adddebtorinformation/submit', upload.fields([
    { name: 'id_card_photo', maxCount: 1 },
    { name: 'id_card_photo2', maxCount: 1 },
    { name: 'current_address_map', maxCount: 1 },
    { name: 'work_address_map', maxCount: 1 },
    { name: 'student_record_photo', maxCount: 1 },
    { name: 'timetable_photo', maxCount: 1 }
]), async (req, res) => {
    try {
        const fileRecords = {};

        // ฟังก์ชันเพื่อบันทึกไฟล์
        const saveFile = async (file) => {
            const base64Data = file.buffer.toString('base64');
            const newFile = new File({
                name: file.originalname,
                data: base64Data,
                mimetype: file.mimetype
            });
            await newFile.save();
            return newFile._id;
        };

        // ฟังก์ชันเพื่อลบไฟล์จากฐานข้อมูล
        const deleteFile = async (fileId) => {
            if (fileId) {
                await File.findByIdAndDelete(fileId);
            }
        };

        let debtor = await DebtorInformation.findOne({ id_card_number: req.body.id_card_number });

        let oldFileRecords = {
            id_card_photo: debtor?.id_card_photo || [],
            id_card_photo2: debtor?.id_card_photo2 || [],
            current_address_map: debtor?.current_address_map || [],
            work_address_map: debtor?.work_address_map || [],
            student_record_photo: debtor?.student_record_photo || [],
            timetable_photo: debtor?.timetable_photo || []
        };

        // บันทึกไฟล์และเก็บ _id ไว้ใน fileRecords
        if (req.files.id_card_photo) {
            fileRecords.id_card_photo = await saveFile(req.files.id_card_photo[0]);
        }
        if (req.files.id_card_photo2) {
            fileRecords.id_card_photo2 = await saveFile(req.files.id_card_photo2[0]);
        }
        if (req.files.current_address_map) {
            fileRecords.current_address_map = await saveFile(req.files.current_address_map[0]);
        }
        if (req.files.work_address_map) {
            fileRecords.work_address_map = await saveFile(req.files.work_address_map[0]);
        }
        if (req.files.student_record_photo) {
            fileRecords.student_record_photo = await saveFile(req.files.student_record_photo[0]);
        }
        if (req.files.timetable_photo) {
            fileRecords.timetable_photo = await saveFile(req.files.timetable_photo[0]);
        }

        const deleteOldFiles = async () => {
            for (const key in fileRecords) {
                const newFileId = fileRecords[key];
                const oldFileIds = oldFileRecords[key] || [];

                if (newFileId) {
                    for (const oldFileId of oldFileIds) {
                        if (oldFileId !== newFileId) {
                            await deleteFile(oldFileId);
                        }
                    }
                }
            }
        };

        if (debtor) {
            debtor.manager = req.body.manager || debtor.manager;
            debtor.date = req.body.date || debtor.date;
            debtor.id_card_number = req.body.id_card_number || debtor.id_card_number;
            debtor.fname = req.body.fname || debtor.fname;
            debtor.lname = req.body.lname || debtor.lname;
            debtor.occupation = req.body.occupation || debtor.occupation;
            debtor.monthly_income_amount = req.body.monthly_income_amount || debtor.monthly_income_amount;
            debtor.seizable_assets_description = req.body.seizable_assets_description || debtor.seizable_assets_description;
            debtor.ig = req.body.ig || debtor.ig;
            debtor.facebook = req.body.facebook || debtor.facebook;
            debtor.line = req.body.line || debtor.line;
            debtor.phone = req.body.phone || debtor.phone;
            debtor.province = req.body.province || debtor.province;
            debtor.currentAddress = req.body.currentAddress || debtor.currentAddress;
            debtor.workOrStudyAddress = req.body.workOrStudyAddress || debtor.workOrStudyAddress;
            debtor.workOrStudyAddress2 = req.body.workOrStudyAddress2 || debtor.workOrStudyAddress2;
            debtor.grade = req.body.grade || debtor.grade;
            debtor.course = req.body.course || debtor.course;
            debtor.id_card_photo = fileRecords.id_card_photo ? [fileRecords.id_card_photo] : debtor.id_card_photo;
            debtor.id_card_photo2 = fileRecords.id_card_photo2 ? [fileRecords.id_card_photo2] : debtor.id_card_photo2;
            debtor.current_address_map = fileRecords.current_address_map ? [fileRecords.current_address_map] : debtor.current_address_map;
            debtor.work_address_map = fileRecords.work_address_map ? [fileRecords.work_address_map] : debtor.work_address_map;
            debtor.student_record_photo = fileRecords.student_record_photo ? [fileRecords.student_record_photo] : debtor.student_record_photo;
            debtor.timetable_photo = fileRecords.timetable_photo ? [fileRecords.timetable_photo] : debtor.timetable_photo;

            await DebtorInformation.findOneAndUpdate(
                { id_card_number: req.body.id_card_number },
                debtor,
                { new: true }
            );

            await deleteOldFiles();
        } else {
            debtor = new DebtorInformation({
                creditorId: req.body.creditorId, // เพิ่มการจัดเก็บ creditorId
                manager: req.body.manager,
                date: req.body.date,
                id_card_number: req.body.id_card_number,
                fname: req.body.fname,
                lname: req.body.lname,
                occupation: req.body.occupation,
                monthly_income_amount: req.body.monthly_income_amount,
                seizable_assets_description: req.body.seizable_assets_description,
                ig: req.body.ig,
                facebook: req.body.facebook,
                line: req.body.line,
                phone: req.body.phone,
                province: req.body.province,
                currentAddress: req.body.currentAddress,
                workOrStudyAddress: req.body.workOrStudyAddress,
                workOrStudyAddress2: req.body.workOrStudyAddress2,
                grade: req.body.grade,
                course: req.body.course,
                id_card_photo: fileRecords.id_card_photo ? [fileRecords.id_card_photo] : [],
                id_card_photo2: fileRecords.id_card_photo2 ? [fileRecords.id_card_photo2] : [],
                current_address_map: fileRecords.current_address_map ? [fileRecords.current_address_map] : [],
                work_address_map: fileRecords.work_address_map ? [fileRecords.work_address_map] : [],
                student_record_photo: fileRecords.student_record_photo ? [fileRecords.student_record_photo] : [],
                timetable_photo: fileRecords.timetable_photo ? [fileRecords.timetable_photo] : [],
                loans: []
            });

            await debtor.save();

            await deleteOldFiles();
        }

        res.redirect('/ข้อมูลลูกหนี้.html');
    } catch (error) {
        console.error('Error handling POST request:', error);
        res.status(500).send('Internal Server Error');
    }
});






//ส่งข้อมูลไปตารางลูกหนี้
app.get('/api/debtor-data', async (req, res) => {
    try {
        const creditorId = req.query.creditorId;

        if (!creditorId) {
            return res.status(400).json({ message: 'Missing creditorId' });
        }

        const data = await DebtorInformation.find({ creditorId: creditorId })
            .sort({ date: -1, _id: -1 });

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});






// ส่งค่าชื่อแอดมินไปหน้าบันทึกข้อมูลลูกหนี้
app.get('/api/managers', async (req, res) => {
    try {
        // ดึง creditorId จาก query string
        const creditorId = req.query.creditorId;

        // ตรวจสอบว่ามี creditorId หรือไม่
        if (!creditorId) {
            return res.status(400).json({ message: 'Missing creditorId' });
        }

        // ดึงข้อมูลแอดมินที่มี creditorId ตรงกับค่าที่ส่งมา
        const managers = await Manager.find({ creditorId: creditorId }, 'nickname'); // ดึงเฉพาะฟิลด์ nickname

        // ตรวจสอบว่าพบข้อมูลหรือไม่
        if (managers.length === 0) {
            return res.status(404).json({ message: 'No managers found for the given creditorId' });
        }

        res.json(managers);
    } catch (err) {
        res.status(500).send(err);
    }
});









//เเสดงข้อมูลลูกหนี้รูปภาพตามid
app.get('/debtorinfo/:id', async (req, res) => {
    try {
        const debtorId = req.params.id;
        const debtor = await DebtorInformation.findById(debtorId).populate([
            'id_card_photo', 
            'id_card_photo2', 
            'current_address_map', 
            'work_address_map', 
            'student_record_photo', 
            'timetable_photo',
            'manager' // Populate the manager field
        ]).lean();

        if (debtor) {
            const transformFileToBase64 = async (fileArray) => {
                if (!fileArray || fileArray.length === 0) return null;
                const file = fileArray[0];
                return `data:${file.mimetype};base64,${file.data}`;
            };

            debtor.id_card_photo_base64 = await transformFileToBase64(debtor.id_card_photo);
            debtor.id_card_photo2_base64 = await transformFileToBase64(debtor.id_card_photo2);
            debtor.current_address_map_base64 = await transformFileToBase64(debtor.current_address_map);
            debtor.work_address_map_base64 = await transformFileToBase64(debtor.work_address_map);
            debtor.student_record_photo_base64 = await transformFileToBase64(debtor.student_record_photo);
            debtor.timetable_photo_base64 = await transformFileToBase64(debtor.timetable_photo);

            res.json(debtor);
        } else {
            res.status(404).json({ error: 'Debtor not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});











// ลบข้อมูลลูกหนี้ตาม ID
app.delete('/api/delete-debtor/:id', async (req, res) => {
    const debtorId = req.params.id;

    try {
        // ค้นหาและลบข้อมูลลูกหนี้ตาม ID
        const deletedDebtor = await DebtorInformation.findByIdAndDelete(debtorId);

        if (!deletedDebtor) {
            return res.status(404).json({ error: 'Debtor not found' });
        }

        res.status(200).json({ message: 'Debtor and related data deleted successfully' });
    } catch (err) {
        console.error('Error deleting debtor:', err);
        res.status(500).json({ error: 'Failed to delete debtor and related data' });
    }
});












// ดึงหมายเลขสัญญาสูงสุดตาม id_card_number จากฐานข้อมูล
app.get('/api/max-contract-number', async (req, res) => {
    try {
        const idCardNumber = req.query.id_card_number;
        const creditorId = req.query.creditorId;

        // ตรวจสอบว่ามี id_card_number หรือไม่
        if (!idCardNumber) {
            return res.status(400).json({ message: 'id_card_number is required' });
        }

        // ตรวจสอบว่ามี creditorId หรือไม่
        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        // ดึงข้อมูลหมายเลขสัญญาสูงสุดที่ตรงกับ id_card_number และ creditorId
        const maxContract = await LoanInformation.findOne({ 
            id_card_number: idCardNumber,
            creditorId: creditorId 
        })
        .sort({ contract_number: -1 });

        const maxContractNumber = maxContract ? maxContract.contract_number : 0;
        res.json({ maxContractNumber });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});





//บันทึกสัญญา
app.post('/AddLoanInformation/submit', upload.fields([
    { name: 'asset_receipt_photo', maxCount: 1 },
    { name: 'icloud_asset_photo', maxCount: 1 },
    { name: 'refund_receipt_photo', maxCount: 1 },
    { name: 'Recommended_photo', maxCount: 1 },
    { name: 'contract', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number = 1,
            loanType,
            loanDate,
            loanPeriod,
            returnDate,
            principal,
            interestRate,
            totalInterest,
            totalRefund,
            manager2,
            Recommended,
            store_assets,
            icloud_assets,
            phoneicloud,
            email_icloud,
            code_icloud,
            code_icloud2
        } = req.body;

        if (!id_card_number || !creditorId) {
            console.error('ID card number and creditorId are required');
            return res.status(400).json({ error: 'ID card number and creditorId are required' });
        }

        const debtor = await DebtorInformation.findOne({ id_card_number });
        if (!debtor) {
            console.error('Debtor not found');
            return res.status(404).json({ error: 'Debtor not found' });
        }

        const icloudRecords = await iCloudRecord.find({ 
            phone_number: phoneicloud,
            user_email: email_icloud
        });

        const files = req.files;
        const savedFiles = {};

        for (const [key, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray.length > 0) {
                const savedFile = await saveFile(fileArray[0]);
                savedFiles[key] = savedFile;
            }
        }

        let loanInfo = await LoanInformation.findOne({
            id_card_number,
            contract_number,
            bill_number
        });

        if (loanInfo) {
            Object.assign(loanInfo, {
                creditorId,
                manager,
                fname,
                lname,
                loanType,
                loanDate,
                loanPeriod,
                returnDate,
                principal,
                interestRate,
                totalInterest,
                totalRefund,
                manager2,
                Recommended,
                storeAssets: store_assets,
                icloudAssets: icloud_assets,
                phoneicloud,
                email_icloud,
                code_icloud,
                code_icloud2,
                debtor: debtor._id,
                icloud_records: icloudRecords.map(record => record._id)
            });

            for (const [key, file] of Object.entries(savedFiles)) {
                if (loanInfo[key]) {
                    loanInfo[key] = [file._id];
                }
            }

            await loanInfo.save();
        } else {
            loanInfo = new LoanInformation({
                creditorId,
                manager,
                id_card_number,
                fname,
                lname,
                contract_number,
                bill_number,
                loanType,
                loanDate,
                loanPeriod,
                returnDate,
                principal,
                interestRate,
                totalInterest,
                totalRefund,
                manager2,
                Recommended,
                storeAssets: store_assets,
                icloudAssets: icloud_assets,
                phoneicloud,
                email_icloud,
                code_icloud,
                code_icloud2,
                asset_receipt_photo: files['asset_receipt_photo'] ? [savedFiles['asset_receipt_photo']._id] : [],
                icloud_asset_photo: files['icloud_asset_photo'] ? [savedFiles['icloud_asset_photo']._id] : [],
                refund_receipt_photo: files['refund_receipt_photo'] ? [savedFiles['refund_receipt_photo']._id] : [],
                Recommended_photo: files['Recommended_photo'] ? [savedFiles['Recommended_photo']._id] : [],
                contract: files['contract'] ? [savedFiles['contract']._id] : [],
                debtor: debtor._id,
                icloud_records: icloudRecords.map(record => record._id)
            });

            const savedLoan = await loanInfo.save();

            await DebtorInformation.updateOne(
                { _id: debtor._id },
                { $push: { loans: savedLoan._id } }
            );
        }

        const response = await fetch('http://localhost:3000/api/calculate-and-save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_card_number, creditorId })
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Error calculating and saving loan data: ${responseText}`);
        }

        const data = await response.json();
        const redirectURL = `/สัญญา.html?id_card_number=${id_card_number}&fname=${fname}&lname=${lname}&manager=${manager}`;

        res.redirect(redirectURL);

    } catch (error) {
        console.error('Error during form submission:', error);
        res.status(500).json({ error: 'Error processing the form submission' });
    }
});





// คำนวณหน้าสัญญา
async function calculateLoanData(loan, currentDate) {
    try {
        const returnDate = new Date(loan.returnDate);
        const currentDateObj = new Date(currentDate);

        const returnDateOnly = new Date(returnDate.toDateString());
        const currentDateOnly = new Date(currentDateObj.toDateString());

        let totalRepayment = Math.round((returnDateOnly - currentDateOnly) / (1000 * 60 * 60 * 24));
        if (totalRepayment <= 0) totalRepayment = '-';

        let daysUntilReturn = Math.round((currentDateOnly - returnDateOnly) / (1000 * 60 * 60 * 24));
        if (daysUntilReturn <= 0) daysUntilReturn = '-';

        const originalTotalRepayment = totalRepayment;
        const originalDaysUntilReturn = daysUntilReturn;

        let totalInterest2 = daysUntilReturn !== '-' ? Math.round(daysUntilReturn * Number(loan.principal) * Number(loan.interestRate) / 100) : 0;
        let originalTotalInterest2 = totalInterest2;

        const refunds = await Refund.find({ id_card_number: loan.id_card_number, bill_number: loan.bill_number, contract_number: loan.contract_number });
        let status = loan.status;

        const seizure = await Seizure.findOne({ loan: loan._id });

        if (seizure) {
            status = "<span style='color: red;'>ยึดทรัพย์</span>";
            const seizureDate = new Date(seizure.seizureDate); // ใช้ seizureDate แทน returnRefundDate
            totalRepayment = Math.round((returnDateOnly - seizureDate) / (1000 * 60 * 60 * 24));
            if (totalRepayment <= 0) totalRepayment = '-';
        
            // คำนวณ daysUntilReturn ใหม่
            daysUntilReturn = Math.round((seizureDate - returnDateOnly) / (1000 * 60 * 60 * 24));
            if (daysUntilReturn <= 0) daysUntilReturn = '-';
        
            // คำนวณ totalInterest2 ใหม่
            totalInterest2 = daysUntilReturn !== '-' ? Math.round(daysUntilReturn * Number(loan.principal) * Number(loan.interestRate) / 100) : 0;
            totalRefund = Math.round(Number(loan.principal) + Number(loan.totalInterest) + Number(loan.totalInterest3 || 0) + Number(totalInterest2));
        } else if (refunds.length > 0) {
            const refund = refunds[0];
            totalRefund = Math.round(Number(loan.principal) + Number(loan.totalInterest) + Number(loan.totalInterest3 || 0) + Number(totalInterest2));

            if (refund.total_refund2 >= totalRefund) {
                status = "<span style='color: green;'>ชำระครบ</span>";
                const returnRefundDate = new Date(refund.return_date);
                totalRepayment = Math.round((returnDateOnly - returnRefundDate) / (1000 * 60 * 60 * 24));
                if (totalRepayment <= 0) totalRepayment = '-';
        
                // คำนวณ daysUntilReturn ใหม่
                daysUntilReturn = Math.round((returnRefundDate - returnDateOnly) / (1000 * 60 * 60 * 24));
                if (daysUntilReturn <= 0) daysUntilReturn = '-';
        
                // คำนวณ totalInterest2 ใหม่
                totalInterest2 = daysUntilReturn !== '-' ? Math.round(daysUntilReturn * Number(loan.principal) * Number(loan.interestRate) / 100) : 0;
                originalTotalInterest2 = totalInterest2; // บันทึกค่า originalTotalInterest2 ไว้
            } else {
                status = "<span style='color: green;'>ต่อดอก</span>";
                const returnRefundDate = new Date(refund.return_date);
                totalRepayment = Math.round((returnDateOnly - returnRefundDate) / (1000 * 60 * 60 * 24));
                if (totalRepayment <= 0) totalRepayment = '-';
        
                // คำนวณ daysUntilReturn ใหม่
                daysUntilReturn = Math.round((returnRefundDate - returnDateOnly) / (1000 * 60 * 60 * 24));
                if (daysUntilReturn <= 0) daysUntilReturn = '-';
        
                // คำนวณ totalInterest2 ใหม่
                totalInterest2 = daysUntilReturn !== '-' ? Math.round(daysUntilReturn * Number(loan.principal) * Number(loan.interestRate) / 100) : 0;
                originalTotalInterest2 = totalInterest2; // บันทึกค่า originalTotalInterest2 ไว้
            }
        } else {
            if (status !== "<span style='color: red;'>เเบล็คลิช</span>") {
                if (currentDateOnly.getTime() > returnDateOnly.getTime()) {
                    status = "<span style='color: orange;'>เลยสัญญา</span>";
                } else if (currentDateOnly.getTime() < returnDateOnly.getTime()) {
                    status = "<span style='color: blue;'>อยู่ในสัญญา</span>";
                } else if (currentDateOnly.getTime() === returnDateOnly.getTime()) {
                    status = "<span style='color: #FF00FF;'>ครบสัญญา</span>";
                }
            }
            totalRefund = Math.round(Number(loan.principal) + Number(loan.totalInterest) + Number(totalInterest2) + Number(loan.totalInterest3 || 0));
        }

        if (status === "<span style='color: red;'>เเบล็คลิช</span>") {
            totalRepayment = "-";
            daysUntilReturn = "-";
            totalInterest2 = originalTotalInterest2;
            totalRefund = Math.round(Number(loan.principal) + Number(loan.totalInterest) + Number(loan.totalInterest3 || 0) + Number(totalInterest2));
        }

        const totalInterest4 = Math.round(Number(loan.totalInterest) + Number(totalInterest2) + Number(loan.totalInterest3 || 0));

        const updatedLoanData = {
            totalRepayment,
            daysUntilReturn,
            totalInterest2: status === "<span style='color: green;'>ชำระครบ</span>" || status === "<span style='color: green;'>ต่อดอก</span>" ? originalTotalInterest2 : totalInterest2,
            totalInterest3: loan.totalInterest3 ? Math.round(Number(loan.totalInterest3)) : 0,
            status,
            totalRefund,
            principal: Math.round(Number(loan.principal)),
            totalInterest4
        };

        await LoanInformation.updateOne({ _id: loan._id }, { $set: updatedLoanData });

        return {
            ...loan._doc,
            ...updatedLoanData
        };
    } catch (error) {
        console.error('Error occurred while calculating loan data:', error.message);
        throw error;
    }
}










// ปิดสัญญาผ่าน API
app.put('/api/close-loan/:loanId', async (req, res) => {
    const loanId = req.params.loanId;

    try {
        // อัปเดตสถานะของสัญญาเป็น 'เเบล็คลิช'
        await LoanInformation.findByIdAndUpdate(
            loanId,
            { status: "<span style='color: red;'>เเบล็คลิช</span>" }
        );

        // คำนวณและอัปเดตข้อมูลของสัญญา
        const loan = await LoanInformation.findById(loanId);
        const currentDate = new Date();
        const calculatedLoanData = await calculateLoanData(loan, currentDate);

        // อัปเดตข้อมูลในฐานข้อมูล
        await LoanInformation.updateOne(
            { _id: loanId },
            { $set: calculatedLoanData }
        );

        res.json(calculatedLoanData); // ส่งข้อมูลที่อัปเดตแล้วกลับไปยัง client
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการปิดสัญญา:', error.message);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการปิดสัญญา' });
    }
});
















// สำหรับการคำนวณและบันทึกข้อมูลที่คำนวณลงในฐานข้อมูล
app.post('/api/calculate-and-save', async (req, res) => {
    try {
        const { id_card_number, creditorId } = req.body; // ดึง id_card_number และ creditorId จาก body
        if (!id_card_number || !creditorId) {
            return res.status(400).json({ message: 'id_card_number and creditorId are required' });
        }

        const loans = await LoanInformation.find({ id_card_number: id_card_number, creditorId: creditorId });
        const currentDate = new Date();

        const loanDataWithCalculations = await Promise.all(loans.map(async (loan) => {
            return await calculateLoanData(loan, currentDate);
        }));

        res.json(loanDataWithCalculations);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการคำนวณและบันทึกข้อมูล:', error.message);
        res.status(500).json({ error: 'An error occurred while calculating and saving loan data' });
    }
});


// ส่งข้อมูลสัญญาไปหน้าสัญา
app.get('/api/loan-data', async (req, res) => {
    try {
        const idCardNumber = req.query.id_card_number;
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query string

        if (!idCardNumber || !creditorId) {
            return res.status(400).json({ message: 'id_card_number and creditorId are required' });
        }

        const loans = await LoanInformation.find({ id_card_number: idCardNumber, creditorId: creditorId })
                                           .sort({ contract_number: -1, bill_number: -1 });
        const currentDate = new Date();

        // คำนวณข้อมูลเพิ่มเติมก่อนส่งไปยังไคลเอนต์
        const loanDataWithCalculations = await Promise.all(loans.map(async (loan) => {
            return await calculateLoanData(loan, currentDate);
        }));

        res.json(loanDataWithCalculations);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching loan data' });
    }
});



// ส่งข้อมูลสัญญาล่าสุดไปหน้าข้อมูลลูกหนี้
app.get('/api/loaninformations/:debtorId', async (req, res) => {
    const debtorId = req.params.debtorId;
    const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters
    const currentDate = new Date(); // วันที่ปัจจุบันสำหรับการคำนวณ

    try {
        // ค้นหาข้อมูลสัญญาล่าสุดที่ตรงกับ debtorId และ creditorId
        const latestLoan = await LoanInformation.findOne({ debtor: debtorId, creditorId: creditorId })
                                                .sort({ contract_number: -1, bill_number: -1 });

        if (!latestLoan) {
            return res.status(404).json({ error: 'Loan information not found' });
        }

        // คำนวณข้อมูลสัญญาล่าสุด
        const updatedLoanData = await calculateLoanData(latestLoan, currentDate);

        res.json(updatedLoanData);
    } catch (error) {
        console.error('Error fetching and calculating loan information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// ส่งข้อมูลเงินต้นสะสมไปยังหน้าลูกหนี้
app.get('/api/loan-principal-sum/:id_card_number', async (req, res) => {
    const idCardNumber = req.params.id_card_number;
    const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

    try {
        console.log('idCardNumber:', idCardNumber);  // Debug id_card_number

        const loans = await LoanInformation.aggregate([
            { 
                $match: { 
                    id_card_number: idCardNumber,
                    creditorId: creditorId, // เพิ่มการกรองด้วย creditorId
                    bill_number: 1  // กำหนดให้เป็นตัวเลข
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalPrincipal: { $sum: { $toDouble: "$principal" } } 
                } 
            }
        ]);
        console.log('Loans:', loans);  // Debug loans

        const totalPrincipal = loans.length > 0 ? loans[0].totalPrincipal : 0;
        res.json({ totalPrincipal });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send(err.message);
    }
});










// ส่งข้อมูลสถานะครบสัญญาไปหน้าแจ้งเตือน
app.get('/api/loans/completed', async (req, res) => {
    try {
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query string

        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        const loans = await LoanInformation.find({ 
            status: "<span style='color: #FF00FF;'>ครบสัญญา</span>",
            creditorId: creditorId // กรองตาม creditorId
        });

        res.json(loans);
    } catch (error) {
        console.error('Error fetching completed loans:', error.message);
        res.status(500).json({ message: error.message });
    }
});

  
  
// ส่งจำนวนการแจ้งเตือนสถานะครบสัญญาไปทุกหน้า
app.get('/api/notifications/count', async (req, res) => {
    try {
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        const count = await LoanInformation.countDocuments({
            status: "<span style='color: #FF00FF;'>ครบสัญญา</span>",
            creditorId: creditorId // ใช้ creditorId ในการคิวรี
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});






// ลบข้อมูลสัญญา
app.delete('/api/delete-loan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await LoanInformation.findById(id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // เรียกใช้ deleteOne เพื่อดำเนินการลบ loan และ trigger pre hook
        await loan.deleteOne();

        res.json({ message: 'Loan deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: `Error while deleting loan: ${err.message}` });
    }
});



//เเสดงข้อมูลในสัญญาตามid
app.get('/api/loanss/:loanId', async (req, res) => {
    try {
      const loanId = req.params.loanId;
      const loan = await LoanInformation.findById(loanId);
  
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }
  
      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
});



//เเสดงข้อมูลรูปภาพในสัญญาตามid
app.get('/loan_id2/:id', async (req, res) => {
    try {
        const loan_id = req.params.id;

        // ดึงข้อมูล LoanInformation โดยใช้ loan_id
        const loan = await LoanInformation.findById(loan_id).lean();

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // ฟังก์ชันดึงข้อมูลไฟล์จากคอลเล็กชัน `files`
        const fetchFiles = async (fileIds) => {
            if (!fileIds || fileIds.length === 0) return [];
            const files = await File.find({ _id: { $in: fileIds } }).select('data mimetype').lean();
            return files.map(file => {
                if (file.data) {
                    // ตรวจสอบและลบข้อมูล `data:image/png;base64` ที่ซ้ำ
                    const base64Data = file.data.replace(/^data:image\/\w+;base64,/, '');
                    return `data:${file.mimetype};base64,${base64Data}`;
                }
                return null;
            }).filter(file => file !== null); // กรองค่า null ออก
        };

        // ดึงไฟล์จากฟิลด์ต่างๆ
        const fileFields = {
            asset_receipt_photo: 'asset_receipt_photo_base64',
            icloud_asset_photo: 'icloud_asset_photo_base64',
            refund_receipt_photo: 'refund_receipt_photo_base64',
            Recommended_photo: 'Recommended_photo_base64',
            contract: 'contract_base64'
        };

        for (const [field, base64Field] of Object.entries(fileFields)) {
            loan[base64Field] = await fetchFiles(loan[field]);
        }

        // ส่งข้อมูลกลับไปยังฝั่งหน้าบ้าน
        res.json(loan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});















// บันทึกคืนเงิน
app.post('/refunds/submit_form', upload.single('refund_receipt_photo'), async (req, res) => {
    try {
        const {
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number,
            principal,
            totalInterest4,
            totalRefund,
            return_date,
            refund_principal,
            refund_interest,
            total_refund2,
            debtAmount,
            loan
        } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!manager || !id_card_number || !fname || !lname || !contract_number || !bill_number || !principal || !totalInterest4 || !totalRefund || !return_date || !refund_principal || !refund_interest || !total_refund2 || !debtAmount) {
            return res.status(400).send('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        // แปลงและปัดเศษข้อมูลที่เป็นตัวเลข
        const totalInterest4Rounded = Math.round(parseFloat(totalInterest4));
        const refundInterestRounded = Math.round(parseFloat(refund_interest));
        const totalRefundRounded = Math.round(parseFloat(totalRefund));
        const refundPrincipalRounded = Math.round(parseFloat(refund_principal));
        const totalRefund2Rounded = Math.round(parseFloat(total_refund2));
        const debtAmountRounded = Math.round(parseFloat(debtAmount));

        // คำนวณ totalInterest5
        const totalInterest5 = calculateTotalInterest5({
            totalInterest4: totalInterest4Rounded,
            refund_interest: refundInterestRounded
        });

        // สร้างเอกสารการคืนเงิน
        const refundData = {
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number,
            principal: principal ? Math.round(parseFloat(principal)) : undefined,
            totalInterest4: totalInterest4Rounded,
            totalInterest5: Math.round(totalInterest5),
            totalRefund: totalRefundRounded,
            return_date,
            refund_principal: refundPrincipalRounded,
            refund_interest: refundInterestRounded,
            total_refund2: totalRefund2Rounded,
            debtAmount: debtAmountRounded,
            loan
        };

        if (req.file) {
            // แปลงไฟล์ที่อัปโหลดเป็น Base64
            const base64Data = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;

            // สร้างเอกสาร File
            const file = new File({
                name: req.file.originalname,
                data: base64Data,
                mimetype: mimeType
            });

            const savedFile = await file.save();
            refundData.refund_receipt_photo = [savedFile._id]; // ใช้ ObjectId ของไฟล์ที่บันทึกแล้ว
        }

        const refund = new Refund(refundData);
        const savedRefund = await refund.save();

        // คำนวณ initial_profit
        const initial_profit = await calculateInitialProfitAfterSaving(id_card_number, savedRefund);
        savedRefund.initial_profit = initial_profit;
        await savedRefund.save();

        // ตรวจสอบและคำนวณข้อมูลการกู้ยืมใหม่หากจำเป็น
        if (totalRefund2Rounded < totalRefundRounded) {
            const loan = await LoanInformation.findOne({ id_card_number, contract_number }).sort({ contract_number: -1, bill_number: -1 });

            if (!loan) {
                throw new Error('ไม่พบข้อมูลสัญญา');
            }

            const newReturnDate = new Date(return_date);
            newReturnDate.setDate(newReturnDate.getDate() + parseInt(loan.loanPeriod, 10));
            const newReturnDateString = newReturnDate.toISOString().split('T')[0];

            const loanData = await calculateLoanData(loan, newReturnDate);

            const newLoanData = {
                creditorId: loan.creditorId,
                manager: loan.manager,
                id_card_number: loan.id_card_number,
                fname: loan.fname,
                lname: loan.lname,
                contract_number: loan.contract_number,
                bill_number: parseInt(loan.bill_number, 10) + 1,
                loanDate: return_date,
                loanPeriod: loan.loanPeriod,
                returnDate: newReturnDateString,
                principal: loan.principal - refundPrincipalRounded,
                interestRate: loan.interestRate,
                totalInterest: Math.round(((loan.principal - refundPrincipalRounded) * loan.loanPeriod * loan.interestRate) / 100),
                totalInterest2: Math.round(loanData.daysUntilReturn * (loan.principal - refundPrincipalRounded) * loan.interestRate / 100),
                totalInterest3: Math.round(totalInterest5),
                totalInterest4: Math.round(((loan.principal - refundPrincipalRounded) * loan.loanPeriod * loan.interestRate) / 100 +
                                loanData.daysUntilReturn * (loan.principal - refundPrincipalRounded) * loan.interestRate / 100 +
                                totalInterest5),
                totalRefund: Math.round((loan.principal - refundPrincipalRounded) +
                                ((loan.principal - refundPrincipalRounded) * loan.loanPeriod * loan.interestRate) / 100 +
                                loanData.daysUntilReturn * (loan.principal - refundPrincipalRounded) * loan.interestRate / 100 +
                                totalInterest5),
                totalRepayment: loanData.totalRepayment,
                daysUntilReturn: loanData.daysUntilReturn,
                status: loanData.status,
                debtor: loan.debtor
            };

            const newLoan = new LoanInformation(newLoanData);
            const savedNewLoan = await newLoan.save();

            console.log('New Loan Data Saved:', savedNewLoan);
        }

        // เปลี่ยนเส้นทางไปยังหน้าที่เกี่ยวข้อง
        const redirectURL = `/คืนเงิน.html?id_card_number=${id_card_number}&fname=${fname}&lname=${lname}&manager=${manager}`;
        res.status(302).redirect(redirectURL);

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการบันทึก Refund:', error.message);
        res.status(500).send('เกิดข้อผิดพลาดในการบันทึก Refund');
    }
});



// ดอกเบี้ยค้าง
function calculateTotalInterest5({ totalInterest4, refund_interest }) {
    const totalInterest5 = Math.round(totalInterest4 - refund_interest);
    return totalInterest5 < 0 ? 0 : totalInterest5;
}




// ส่วนที่ต้องแบ่ง
async function calculateInitialProfitAfterSaving(id_card_number, currentRefund) {
    try {
        // ดึงข้อมูล refunds ที่เพิ่งถูกบันทึกเสร็จแล้ว
        const refunds = await Refund.find({ id_card_number });

        if (!refunds || refunds.length === 0) {
            console.log('No refunds found or refunds array is empty');
            return 0; // หรือค่าเริ่มต้นตามที่คุณต้องการให้กลับมา
        }

        // รวมค่า total_refund2 ของบิลที่มี id_card_number เหมือนกัน
        const total_refund2_sum = refunds
            .filter(refund => refund.id_card_number === id_card_number)
            .reduce((sum, refund) => sum + Math.round(parseFloat(refund.total_refund2)), 0);

        // หา principal ของบิลที่เท่ากับ 1 ที่มี id_card_number เหมือนกัน
        const principal_bill_1_refund = refunds.find(refund => refund.bill_number === '1' && refund.id_card_number === id_card_number);
        const principal_bill_1 = principal_bill_1_refund ? Math.round(parseFloat(principal_bill_1_refund.principal)) : 0;

        // คำนวณ initial profit โดยใช้ total_refund2_sum หักด้วย principal ของบิลที่ 1
        let initial_profit = Math.round(total_refund2_sum - principal_bill_1);

        // ถ้า initial_profit เป็นบวก ให้ลบ initial_profit ที่มีค่าเป็นบวกของรายการที่มี contract_number เหมือนกันและ bill_number น้อยกว่า bill_number ของรายการปัจจุบัน
        console.log("🚀 ~ calculateInitialProfitAfterSaving ~ initial_profit:", initial_profit)
        if (initial_profit > 0) {
            const currentBillNumber = parseInt(principal_bill_1_refund.bill_number);
            let total_initial_profit_befor = 0
            for (let i=0;i < (refunds.length-1);i++) {
                let refund = refunds[i]
                if (refund.initial_profit && parseInt(refund.initial_profit)>0){
                    total_initial_profit_befor += parseInt(refund.initial_profit)
                }
            }
            // let refund = refunds[refunds.length-1]
            // console.log((initial_profit - total_initial_profit_befor))
            initial_profit = (initial_profit - total_initial_profit_befor)
            // await refund.save()
                
            // ตั้งค่า status เป็น "ยังไม่แบ่ง" สำหรับ currentRefund ที่มี initial_profit เป็นบวก
            currentRefund.status = '<span style="color: orange;">ยังไม่แบ่ง</span>';
                } else {
            // ตรวจสอบและตั้งค่า status เป็น "ไม่ควรแบ่ง" สำหรับ currentRefund ที่มี initial_profit เป็นลบ
            currentRefund.status = '<span style="color: red;">ไม่ควรเเบ่ง</span>';
        }

        await currentRefund.save();

        // ใส่ console.log เพื่อตรวจสอบค่า
        console.log('Total Refund2 Sum:', total_refund2_sum);
        console.log('Principal Bill 1:', principal_bill_1);
        console.log('Initial Profit:', initial_profit);

        return initial_profit; // คืนค่าเป็นตัวเลขที่คำนวณได้
    } catch (error) {
        console.error('Error fetching refunds:', error.message);
        return 0; // หรือค่าเริ่มต้นตามที่คุณต้องการให้กลับมา
    }
}






// ส่งข้อมูลไปหน้าคืนเงิน
app.get('/api/refunds', async (req, res) => {
    try {
        const idCardNumber = req.query.id_card_number; // ดึง id_card_number จาก query string
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query string

        if (!idCardNumber || !creditorId) {
            return res.status(400).json({ message: 'id_card_number and creditorId are required' });
        }

        const refunds = await Refund.aggregate([
            { $match: { id_card_number: idCardNumber, creditorId: creditorId } }, // กรองตาม id_card_number และ creditorId
            { $addFields: {
                contract_number_num: { $toDouble: "$contract_number" },
                bill_number_num: { $toDouble: "$bill_number" }
            }},
            { $sort: { contract_number_num: -1, bill_number_num: -1 }},
            { $lookup: {
                from: 'loaninformations', // ตรวจสอบว่าชื่อ collection นี้ถูกต้อง
                localField: 'loan',
                foreignField: '_id',
                as: 'loan'
            }},
            { $unwind: {
                path: '$loan',
                preserveNullAndEmptyArrays: true  // เพื่อให้แน่ใจว่ามีการจัดการกับกรณีที่ไม่มีข้อมูล loan
            }},
            { $addFields: {
                contract_number: '$loan.contract_number', // ดึงค่า contract_number จาก loan เพื่อให้แน่ใจว่าส่งไปในผลลัพธ์
                bill_number: '$loan.bill_number' // ดึงค่า bill_number จาก loan เพื่อให้แน่ใจว่าส่งไปในผลลัพธ์
            }}
        ]);

        res.json(refunds);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Refund:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล Refund');
    }
});






// ส่งดอกเบี้ยสะสมไปหน้าลูกหนี้
app.get('/api/refund-interest-sum/:id_card_number', async (req, res) => {
    const idCardNumber = req.params.id_card_number;
    const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

    try {
        const refunds = await Refund.aggregate([
            { 
                $match: { 
                    id_card_number: idCardNumber,
                    creditorId: creditorId // เพิ่มการกรองด้วย creditorId
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalRefundInterest: { $sum: { $toDouble: "$refund_interest" } } 
                } 
            }
        ]);

        const totalRefundInterest = refunds.length > 0 ? refunds[0].totalRefundInterest : 0;
        res.json({ totalRefundInterest });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send(err.message);
    }
});



// ลบคืนเงิน
app.delete('/api/refunds/:refundId', async (req, res) => {
    try {
        const refundId = req.params.refundId;

        // ค้นหาและลบ ProfitSharing ที่อ้างอิงถึง Refund
        const profitSharings = await ProfitSharing.find({ refund: refundId });

        if (profitSharings.length > 0) {
            // ลบไฟล์ที่เกี่ยวข้องกับ ProfitSharing
            for (const profitSharing of profitSharings) {
                const filesToDelete = [];
                if (profitSharing.collectorReceiptPhoto && profitSharing.collectorReceiptPhoto.length > 0) {
                    filesToDelete.push(...profitSharing.collectorReceiptPhoto);
                }
                if (profitSharing.managerReceiptPhoto && profitSharing.managerReceiptPhoto.length > 0) {
                    filesToDelete.push(...profitSharing.managerReceiptPhoto);
                }
                if (profitSharing.receiverReceiptPhoto && profitSharing.receiverReceiptPhoto.length > 0) {
                    filesToDelete.push(...profitSharing.receiverReceiptPhoto);
                }

                if (filesToDelete.length > 0) {
                    await File.deleteMany({ _id: { $in: filesToDelete } });
                }
            }

            // ลบ ProfitSharing ที่อ้างอิงถึง Refund
            await ProfitSharing.deleteMany({ refund: refundId });
        }

        // ค้นหาและลบ Refund โดยใช้ ID
        const deletedRefund = await Refund.findByIdAndDelete(refundId);
        if (!deletedRefund) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลการคืนเงิน' });
        }

        // ลบไฟล์ที่เกี่ยวข้องกับ Refund
        if (deletedRefund.refund_receipt_photo && deletedRefund.refund_receipt_photo.length > 0) {
            await File.deleteMany({ _id: { $in: deletedRefund.refund_receipt_photo } });
        }

        res.json({ message: 'ลบข้อมูลการคืนเงินเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error.message);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});


//เเสดงข้อมูลคืนเงินตามid
app.get('/api/refundss/:id', async (req, res) => {
    try {
        const refundId = req.params.id;
        const refund = await Refund.findById(refundId).populate('refund_receipt_photo');

        if (refund) {
            res.json(refund);
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูลการคืนเงินที่ระบุ' });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});










// บันทึกส่วนแบ่ง
function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0 ต้องบวก 1 และ pad ให้มีสองหลัก
    const dd = String(date.getDate()).padStart(2, '0'); // pad ให้มีสองหลัก
    return `${yyyy}-${mm}-${dd}`;
}

// บันทึกส่วนแบ่ง
app.post('/profit-sharing', upload.fields([
    { name: 'collector_receipt_photo', maxCount: 1 },
    { name: 'manager_receipt_photo', maxCount: 1 },
    { name: 'receiver_receipt_photo', maxCount: 1 }
]), async (req, res) => {
    let refundDoc; // ประกาศตัวแปร refundDoc ที่นี่

    try {
        const {
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number,
            return_date_input,
            initial_profit,
            collector_name,
            collector_share_percent,
            collector_share,
            initial_profit2,
            manager_name,
            manager_share2,
            manager_share,
            receiver_profit,
            receiver_name,
            receiver_share_percent,
            receiver_share,
            total_share,
            net_profit,
            refundId
        } = req.body;

        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        function encodeFileToBase64(file) {
            return file.buffer.toString('base64');
        }

        async function saveFileToDatabase(file) {
            const base64Data = encodeFileToBase64(file);

            const newFile = new File({
                name: file.originalname,
                data: base64Data,
                mimetype: file.mimetype
            });

            await newFile.save();
            return newFile._id;
        }

        const collectorReceiptPhotoId = req.files['collector_receipt_photo']
            ? await saveFileToDatabase(req.files['collector_receipt_photo'][0])
            : null;

        const managerReceiptPhotoId = req.files['manager_receipt_photo']
            ? await saveFileToDatabase(req.files['manager_receipt_photo'][0])
            : null;

        const receiverReceiptPhotoId = req.files['receiver_receipt_photo']
            ? await saveFileToDatabase(req.files['receiver_receipt_photo'][0])
            : null;

        const ObjectId = require('mongoose').Types.ObjectId;
        const refundObjectId = new ObjectId(refundId);

        refundDoc = await Refund.findById(refundObjectId);
        if (!refundDoc) {
            console.log("Refund not found!");
            return res.status(404).json({ message: 'Refund not found' });
        }

        const previousStatus = refundDoc.status;

        const [year, month, day] = return_date_input.split('-').map(Number);
        const returnDate = new Date(year, month - 1, day);

        console.log("Formatted returnDate:", formatDate(returnDate));

        const profitSharing = new ProfitSharing({
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number,
            returnDate: formatDate(returnDate),
            initialProfit: parseFloat(initial_profit),
            collectorName: collector_name,
            collectorSharePercent: parseFloat(collector_share_percent),
            collectorShare: parseFloat(collector_share),
            collectorReceiptPhoto: collectorReceiptPhotoId,
            initialProfit2: parseFloat(initial_profit2),
            managerName: manager_name,
            managerSharePercent: parseFloat(manager_share2),
            managerShare: parseFloat(manager_share),
            managerReceiptPhoto: managerReceiptPhotoId,
            receiverProfit: parseFloat(receiver_profit),
            receiverName: receiver_name,
            receiverSharePercent: parseFloat(receiver_share_percent),
            receiverShare: parseFloat(receiver_share),
            receiverReceiptPhoto: receiverReceiptPhotoId,
            totalShare: parseFloat(total_share),
            netProfit: parseFloat(net_profit),
            refund: refundObjectId,
            originalStatus: previousStatus
        });

        console.log('profitSharing:', profitSharing);

        await profitSharing.save();

        refundDoc.status = '<span style="color: green;">เเบ่งเเล้ว</span>';
        await refundDoc.save();

        res.redirect(`/ส่วนเเบ่ง.html?id_card_number=${id_card_number}&fname=${fname}&lname=${lname}&manager=${manager}`);
    } catch (error) {
        console.error(error);

        if (refundDoc) {
            refundDoc.status = previousStatus;
            await refundDoc.save();
        }

        res.status(500).json({ message: 'Server error' });
    }
});





//ส่งข้อมูลไปหน้าส่วนเเบ่ง
app.get('/get-profit-sharing-data/:id_card_number', async (req, res) => {
    try {
        const idCardNumber = req.params.id_card_number;
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

        if (!idCardNumber || !creditorId) {
            return res.status(400).json({ message: 'id_card_number and creditorId are required' });
        }

        // Find profit sharing data based on id_card_number and creditorId from the database
        let profitSharingData = await ProfitSharing.find({ 
            id_card_number: idCardNumber,
            creditorId: creditorId // กรองข้อมูลตาม creditorId
        });

        // Convert contract_number and bill_number to numbers for sorting
        profitSharingData = profitSharingData.map(item => ({
            ...item._doc, // Preserve the existing document properties
            contract_number_num: parseInt(item.contract_number, 10),
            bill_number_num: parseInt(item.bill_number, 10)
        }));

        // Sort by contract_number and bill_number as numbers in descending order
        profitSharingData.sort((a, b) => 
            b.contract_number_num - a.contract_number_num || b.bill_number_num - a.bill_number_num
        );

        // Send the sorted profit sharing data as JSON response
        res.json(profitSharingData);
    } catch (error) {
        // If there is an error, send a 500 status code with an error message
        console.error('Error fetching profit sharing data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





// ส่งค่าชื่อแอดมินรับเงิน
app.get('/api/receiver_name', async (req, res) => {
    try {
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        // ดึงข้อมูล nickname ของ Manager ตาม creditorId
        const receiverNames = await Manager.find({ creditorId: creditorId }, 'nickname');

        res.json(receiverNames);
    } catch (err) {
        console.error('Error fetching receiver names:', err);
        res.status(500).send(err.message);
    }
});





// ลบข้อมูลส่วนแบ่ง
app.delete('/api/delete-profit-sharing/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ค้นหาเอกสาร ProfitSharing ที่ต้องการลบ
        const profitSharingDoc = await ProfitSharing.findById(id).populate('collectorReceiptPhoto managerReceiptPhoto receiverReceiptPhoto');
        
        if (!profitSharingDoc) {
            return res.status(404).json({ message: 'Profit Sharing data not found' });
        }

        // ค้นหาเอกสาร Refund ที่เกี่ยวข้อง
        const refundDoc = await Refund.findById(profitSharingDoc.refund);
        
        if (!refundDoc) {
            return res.status(404).json({ message: 'Refund not found' });
        }

        // ตรวจสอบและรวบรวมรายการ ID ของไฟล์
        const fileIds = [
            ...(Array.isArray(profitSharingDoc.collectorReceiptPhoto) ? profitSharingDoc.collectorReceiptPhoto : []),
            ...(Array.isArray(profitSharingDoc.managerReceiptPhoto) ? profitSharingDoc.managerReceiptPhoto : []),
            ...(Array.isArray(profitSharingDoc.receiverReceiptPhoto) ? profitSharingDoc.receiverReceiptPhoto : [])
        ];

        // ลบไฟล์ภาพที่เกี่ยวข้องหากมี
        if (fileIds.length > 0) {
            const deleteFilesResult = await File.deleteMany({ _id: { $in: fileIds } });
            console.log('Files deleted:', deleteFilesResult);
        } else {
            console.log('No files associated with Profit Sharing.');
        }

        // ลบข้อมูลส่วนแบ่งจากฐานข้อมูล
        const deletedProfitSharing = await ProfitSharing.findByIdAndDelete(id);

        if (!deletedProfitSharing) {
            return res.status(404).json({ message: 'Profit Sharing data not found for deletion' });
        }

        // คืนค่า status กลับไปยังค่าก่อนหน้า
        refundDoc.status = profitSharingDoc.originalStatus;
        await refundDoc.save();

        res.status(200).json({ message: 'Profit sharing data deleted successfully' });
    } catch (error) {
        console.error('Error deleting Profit Sharing data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});








//เเสดงข้อมูลส่วนเเบ่งตามid
app.get('/api/profitsharingss/:id', async (req, res) => {
    try {
        const id = req.params.id; // ใช้ _id ในการค้นหา
        const profitSharing = await ProfitSharing.findById(id)
            .populate('collectorReceiptPhoto')
            .populate('managerReceiptPhoto')
            .populate('receiverReceiptPhoto');

        if (!profitSharing) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการแบ่งกำไรนี้' });
        }

        res.json(profitSharing);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});






















// บันทึกข้อมูลเเอดมิน
app.post('/submit', async (req, res) => {
    const managerId = req.body._id; // รับ ID จากพารามิเตอร์

    if (managerId) {
        // อัปเดตข้อมูล
        try {
            const updatedManager = await Manager.findByIdAndUpdate(managerId, {
                creditorId: req.body.creditorId,
                record_date: req.body.record_date,
                id_card_number: req.body.id_card_number,
                fname: req.body.fname,
                lname: req.body.lname,
                nickname: req.body.nickname,
                phone: req.body.phone,
                ig: req.body.ig,
                facebook: req.body.facebook,
                line: req.body.line,
                authentication: req.body.authentication
            }, { new: true }); // new: true จะคืนค่าเอกสารที่อัปเดตแล้ว
            
            if (updatedManager) {
                res.redirect('/เเอดมิน.html');
            } else {
                res.status(404).send('ไม่พบข้อมูลผู้จัดการที่ต้องการอัปเดต');
            }
        } catch (error) {
            console.error('Error updating manager:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        }
    } else {
        // บันทึกข้อมูลใหม่
        try {
            const managerInstance = new Manager({
                creditorId: req.body.creditorId,
                record_date: req.body.record_date,
                id_card_number: req.body.id_card_number,
                fname: req.body.fname,
                lname: req.body.lname,
                nickname: req.body.nickname,
                phone: req.body.phone,
                ig: req.body.ig,
                facebook: req.body.facebook,
                line: req.body.line,
                authentication: req.body.authentication
            });

            await managerInstance.save();
            res.redirect('/เเอดมิน.html');
        } catch (error) {
            console.error('Error saving manager:', error);
            res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    }
});




//คำนวณลูกหนี้ทั้งหมดหรืออยู่ในสัญญาหรือเลยสัญญาไปหน้าเเอดมิน
async function findDebtorStatus(manager){
    const result = await LoanInformation.aggregate([
        { 
            $match: { 
                manager: manager.nickname, // ใช้ managerNickname ตรงๆ
            }
        },
        {
            $sort: {
                contract_number: -1,
                bill_number: -1
            }
        },
        {
            $group: {
                _id: "$id_card_number",
                latestLoan: { $first: "$$ROOT" }
            }
        },

    ]);
    let inContractCount = 0
    let lateContractCount = 0
    const statusLoan = ["<span style='color: blue;'>อยู่ในสัญญา</span>","<span style='color: green;'>ต่อดอก</span>"]

    for(let i of result){
        if (statusLoan.includes(i.latestLoan.status)){
            inContractCount += 1
        }
        else if (i.latestLoan.status=="<span style='color: orange;'>เลยสัญญา</span>") {
            lateContractCount += 1
        }
    }

    return {
        inContractCount : inContractCount,
        lateContractCount : lateContractCount,
        loanCount: result.length,
    }
}



// ส่งข้อมูลคำนวณลูกหนี้ทั้งหมดหรืออยู่ในสัญญาหรือเลยสัญญาไปหน้าแอดมิน
app.get('/api/managersList', async (req, res) => {
    try {
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        // ดึงข้อมูลผู้จัดการที่ตรงตาม creditorId และจัดเรียงตามวันที่ล่าสุด
        let managers = await Manager.find({ creditorId: creditorId }).sort({ date: -1 });

        // กำหนดสถานะของลูกหนี้
        const statusLoan = ["<span style='color: blue;'>อยู่ในสัญญา</span>", "<span style='color: green;'>ต่อดอก</span>"];

        // ดึงสถานะของลูกหนี้พร้อมกับข้อมูลผู้จัดการ
        managers = await Promise.all(managers.map(async (manager) => ({
            ...manager._doc,
            debtor: await findDebtorStatus(manager, statusLoan)
        })));

        // ส่งข้อมูลในรูปแบบ JSON
        res.json(managers);
    } catch (error) {
        console.log("🚀 ~ app.get ~ error:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน' });
    }
});






// ลบข้อมูลเเอดมิน
app.delete('/api/managers/:id', async (req, res) => {
    const managerId = req.params.id;
    try {
        const deletedManager = await Manager.findByIdAndDelete(managerId);
        if (!deletedManager) {
            return res.status(404).json({ message: 'ไม่พบผู้จัดการที่ต้องการลบ' });
        }
        res.json({ message: 'ลบข้อมูลผู้จัดการเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้จัดการ' });
    }
});



//เเสดงข้อมูลตามไอดี
app.get('/api/managersss/:id', async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id).exec();
        if (manager) {
            res.json(manager);
        } else {
            res.status(404).json({ message: 'Manager not found' });
        }
    } catch (error) {
        console.error('Error fetching manager:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// บันทึกยึดทรัพย์
app.post('/api/seize-assets', upload.fields([{ name: 'assetPhoto' }, { name: 'seizureCost2' }]), async (req, res) => {
    try {
        const {
            creditorId,
            id_card_number,
            contract_number,
            bill_number,
            seizureDate,
            principal,
            seizureCost,
            totalproperty,
            seizedAssetType,
            assetName,
            assetDetails,
            loan // ใช้ loan ค่าที่ส่งมาจะต้องเป็น ObjectId
        } = req.body;

        // ตรวจสอบข้อมูลที่สำคัญ
        if (!loan) {
            return res.status(400).send('Error: Loan ID is required.');
        }

        // บันทึกไฟล์ในฐานข้อมูล
        const fileIds = {};
        if (req.files['assetPhoto']) {
            fileIds['assetPhoto'] = [];
            for (const file of req.files['assetPhoto']) {
                const savedFile = await saveFile(file);
                fileIds['assetPhoto'].push(savedFile._id);
            }
        }

        if (req.files['seizureCost2']) {
            fileIds['seizureCost2'] = [];
            for (const file of req.files['seizureCost2']) {
                const savedFile = await saveFile(file);
                fileIds['seizureCost2'].push(savedFile._id);
            }
        }

        // สร้างเอกสารยึดทรัพย์
        const newSeizure = new Seizure({
            creditorId,
            id_card_number,
            contract_number,
            bill_number,
            seizureDate,
            principal,
            collector_name: req.body.collector_name,
            seizureCost: req.body.seizureCost,
            totalproperty: req.body.totalproperty,
            seizedAssetType,
            assetName,
            assetDetails,
            assetPhoto: fileIds['assetPhoto'] || [],
            seizureCost2: fileIds['seizureCost2'] || [],
            status: "<span style='color: red;'>ยังไม่ขาย</span>", // หรือสถานะอื่น ๆ ที่เหมาะสม
            loan // ค่าของ `loan` ต้องเป็น ObjectId ที่อ้างอิงถึงเอกสารใน `LoanInformation`
        });

        await newSeizure.save();
        res.redirect('/คลังทรัพย์สิน.html'); // เปลี่ยนเส้นทางไปยังหน้า คลังทรัพย์สิน.html
    } catch (err) {
        res.status(400).send(`Error: ${err.message}`);
    }
});





//เช็คการเพิ่มตัวเลือกประเภทและชื่อทรัพย์ที่ยึด
app.get('/check-duplicate', async (req, res) => {
    const { type, value, creditorId } = req.query; // ดึง creditorId จาก query parameters
    
    try {
      let exists;
      
      if (type === 'seizedAssetType') {
        // ตรวจสอบว่ามีประเภททรัพย์ที่ยึดอยู่ในฐานข้อมูลสำหรับ creditorId ที่ระบุหรือไม่
        exists = await Seizure.exists({ seizedAssetType: value, creditorId: creditorId });
      } else if (type === 'assetName') {
        // ตรวจสอบว่ามีชื่อทรัพย์ที่ยึดอยู่ในฐานข้อมูลสำหรับ creditorId ที่ระบุหรือไม่
        exists = await Seizure.exists({ assetName: value, creditorId: creditorId });
      }
    
      res.json({ exists });
    } catch (error) {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' });
    }
  });
  




// ส่งข้อมูลไปหน้าคลังทรัพย์สิน
app.get('/api/seize-assetsss', async (req, res) => {
    try {
        const { creditorId } = req.query; // ดึง creditorId จาก query parameters

        // ตรวจสอบว่ามี creditorId หรือไม่
        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        // ค้นหาข้อมูลจากฐานข้อมูลโดยใช้ creditorId
        const seizures = await Seizure.find({ creditorId: creditorId })
            .sort({ seizureDate: -1, _id: -1 }); // จัดเรียงตามวันที่ล่าสุดไปเก่าสุด และตาม _id เป็นการสำรอง
        
        res.json(seizures);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});





// ลบข้อมูลทรัพย์สิน
app.delete('/api/seize-assets/:seizureId', async (req, res) => {
    try {
        const seizureId = req.params.seizureId;

        // Find and delete related sales
        const sales = await Sale.find({ seizure_id: seizureId }).populate('sell_slip');
        if (sales.length > 0) {
            // Delete files associated with each sale
            const fileIds = sales.flatMap(sale => sale.sell_slip);
            if (fileIds.length > 0) {
                await File.deleteMany({ _id: { $in: fileIds } });
            }

            // Delete the sales
            await Sale.deleteMany({ seizure_id: seizureId });
        }

        // Find and delete the seizure
        const seizure = await Seizure.findByIdAndDelete(seizureId).populate('assetPhoto seizureCost2');
        if (!seizure) {
            return res.status(404).send("ไม่พบทรัพย์สินที่ต้องการลบ");
        }

        // Delete associated files from Seizure
        if (seizure.assetPhoto.length > 0) {
            await File.deleteMany({ _id: { $in: seizure.assetPhoto } });
        }
        if (seizure.seizureCost2.length > 0) {
            await File.deleteMany({ _id: { $in: seizure.seizureCost2 } });
        }

        res.send(seizure);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});



// เส้นทางสำหรับดึงข้อมูลยึดทรัพย์ตาม ID
app.get('/api/seize-assetss/:id', async (req, res) => {
    try {
        const seizureId = req.params.id;

        // ค้นหาข้อมูลยึดทรัพย์ในฐานข้อมูล
        const seizure = await Seizure.findById(seizureId)
            .populate('assetPhoto') // ตรวจสอบว่า populate ทำงานได้อย่างถูกต้อง
            .populate('seizureCost2'); // ตรวจสอบว่า populate ทำงานได้อย่างถูกต้อง

        if (!seizure) {
            return res.status(404).send('Seizure not found');
        }

        // ส่งข้อมูลกลับไปยังไคลเอนต์
        res.json(seizure);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});
















// บันทึกการขายทรัพย์
app.post('/submit-sale', upload.single('sell_slip'), async (req, res) => {
    const { creditorId, id_card_number, contract_number, bill_number, totalproperty, sell_date, assetName, assetDetails, sellamount, netprofit, seizure_id } = req.body;
    const sell_slip_file = req.file; // ไฟล์ที่อัพโหลด
    
    try {
        // ตรวจสอบว่า seizure_id เป็น ObjectId ที่ถูกต้อง
        if (!mongoose.Types.ObjectId.isValid(seizure_id)) {
            throw new Error('Invalid seizure ObjectId');
        }

        // แปลงไฟล์ที่อัพโหลดเป็น Base64 data
        let sell_slip = null;
        if (sell_slip_file) {
            sell_slip = {
                name: sell_slip_file.originalname,
                data: `data:${sell_slip_file.mimetype};base64,${sell_slip_file.buffer.toString('base64')}`,
                mimetype: sell_slip_file.mimetype
            };
        }

        // กำหนดสถานะตามค่า netprofit
        let status;
        if (netprofit > 0) {
            status = "<span style='color: green;'>กำไร</span>";
        } else if (netprofit < 0) {
            status = "<span style='color: red;'>ขาดทุน</span>";
        } else {
            status = "<span style='color: orange;'>คุ้มทุน</span>"; // ในกรณีที่ netprofit เป็นศูนย์
        }

        // สร้างข้อมูลการขายใหม่
        const newSale = new Sale({
            creditorId,
            id_card_number,
            contract_number,
            bill_number,
            totalproperty,
            sell_date,
            assetName,
            assetDetails,
            sellamount,
            netprofit,
            status, // กำหนดค่าสถานะตามผลลัพธ์ของ netprofit
            sell_slip: sell_slip ? await new File(sell_slip).save() : null, // บันทึกไฟล์เป็น Base64 data
            seizure_id: seizure_id // เชื่อมต่อกับ ID ของการยึดทรัพย์
        });

        // บันทึกข้อมูลการขายลงใน MongoDB
        const savedSale = await newSale.save();

        // หาข้อมูลการยึดทรัพย์ที่เกี่ยวข้อง
        const seizure = await Seizure.findById(seizure_id);

        if (!seizure) {
            throw new Error('ไม่พบข้อมูลการยึดทรัพย์ที่เกี่ยวข้อง');
        }

        // อัพเดทข้อมูลการขายในข้อมูลการยึดทรัพย์
        seizure.status = "<span style='color: green;'>ขายเเล้ว</span>"; // ตั้งค่าสถานะการขายในการยึดทรัพย์
        seizure.sale = savedSale._id; // เก็บ ID ของการขายที่เกี่ยวข้องกับการยึดทรัพย์

        // บันทึกการเปลี่ยนแปลงลงใน MongoDB
        await seizure.save();

        // บันทึกสำเร็จ ให้ redirect ไปยังหน้า "ขายทรัพย์สิน.html"
        res.redirect('/ขายทรัพย์สิน.html');
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
});



//ส่งข้อมูลไปหน้าขายทรัพย์
app.get('/sales', async (req, res) => {
    try {
        const creditorId = req.query.creditorId; // ดึง creditorId จาก query parameters

        if (!creditorId) {
            return res.status(400).json({ message: 'creditorId is required' });
        }

        // หาข้อมูลการขายทั้งหมดจากฐานข้อมูลที่ตรงกับ creditorId
        const sales = await Sale.find({ creditorId: creditorId }) // ปรับค้นหาข้อมูลตาม creditorId
            .populate('seizure_id')  // อ้างอิงถึง seizure_id ซึ่งเชื่อมโยงกับ Seizure schema
            .sort({ sell_date: -1, _id: -1 }); // จัดเรียงตามวันที่ (ล่าสุดไปเก่าสุด) และสำรองด้วย _id

        // ส่งข้อมูลการขายในรูปแบบ JSON
        res.json(sales);
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการขาย:', err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลการขาย');
    }
});




// ลบข้อมูลขายทรัพย์
app.delete('/sales/:saleId', async (req, res) => {
    try {
        const { saleId } = req.params;
        const deletedSale = await Sale.findByIdAndDelete(saleId);

        if (!deletedSale) {
            return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        }

        console.log('Deleted Sale:', deletedSale);

        // ตรวจสอบว่ามีไฟล์ที่เกี่ยวข้องกับ Sale หรือไม่
        if (deletedSale.sell_slip && deletedSale.sell_slip.length > 0) {
            // ลบไฟล์จากฐานข้อมูล
            await File.deleteMany({ _id: { $in: deletedSale.sell_slip } });
            console.log('Deleted related files');
        } else {
            console.log('ไม่มีไฟล์ที่เกี่ยวข้องกับ Sale นี้');
        }

        // ค้นหา Seizure ที่เกี่ยวข้องกับ sale ที่ถูกลบ
        const seizure = await Seizure.findById(deletedSale.seizure_id);

        if (seizure) {
            console.log('Found Seizure:', seizure);
            // อัปเดตสถานะกลับไปเป็นค่าดั้งเดิม (เช่น "ยังไม่ขาย")
            seizure.status = "<span style='color: red;'>ยังไม่ขาย</span>";
            await seizure.save();
            console.log('Updated Seizure:', seizure);
        } else {
            console.log('ไม่พบ Seizure ที่เกี่ยวข้อง');
        }

        res.status(200).json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
});


//เเสดงข้อมูลขายทรัพย์ตามไอดีไว้สำหรับดู
app.get('/saless/:id', async (req, res) => {
    try {
        // ค้นหาข้อมูลการขายทรัพย์และเชื่อมโยงกับข้อมูลไฟล์ภาพ
        const sale = await Sale.findById(req.params.id).populate('sell_slip');

        if (!sale) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการขายทรัพย์' });
        }

        res.json(sale);
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});





// บันทึกไอคราว
// อัปเดตข้อมูล iCloudRecord หรือสร้างใหม่ถ้าไม่มี _id
app.post('/save_record', async (req, res) => {
    try {
        const {
            _id, // รับ _id หากมี
            creditorId,
            record_date,
            device_id,
            phone_number,
            user_email,
            email_password,
            icloud_password
        } = req.body;

        console.log("Received data:", req.body);

        // ค้นหา LoanInformation ที่มี email_icloud เหมือนกับ user_email ที่ส่งมา
        const loanInformations = await LoanInformation.find({ email_icloud: user_email });

        // นับจำนวน iCloudRecord ที่มีการอ้างอิงจาก LoanInformation ที่พบ
        let countIcloudRecords = 0;
        for (const loanInfo of loanInformations) {
            countIcloudRecords += loanInfo.icloud_records.length;
        }

        console.log(`Found ${countIcloudRecords} iCloudRecords with matching email_icloud: ${user_email}`);

        let savedRecord;

        if (_id) {
            // อัปเดตข้อมูล iCloudRecord ที่มี _id
            savedRecord = await iCloudRecord.findByIdAndUpdate(
                _id,
                {
                    creditorId,
                    record_date,
                    device_id,
                    phone_number,
                    user_email,
                    email_password,
                    icloud_password,
                    number_of_users: countIcloudRecords, // อัปเดตจำนวน iCloudRecord จาก LoanInformation
                    status: "active" // ตั้งค่าสถานะ
                },
                { new: true } // คืนค่าข้อมูลใหม่หลังจากอัปเดต
            );
            console.log("iCloud record updated successfully");
        } else {
            // สร้าง iCloudRecord ใหม่
            const newRecord = new iCloudRecord({
                creditorId,
                record_date,
                device_id,
                phone_number,
                user_email,
                email_password,
                icloud_password,
                number_of_users: countIcloudRecords, // กำหนดจำนวน iCloudRecord จาก LoanInformation
                status: "active" // ตั้งค่าสถานะ
            });

            savedRecord = await newRecord.save();
            console.log("iCloud record saved successfully");
        }

        res.status(201).redirect('/ไอคราว.html');
    } catch (err) {
        console.error("Error saving or updating iCloud record:", err);
        res.status(500).send('Failed to save or update iCloud Record');
    }
});









// ส่งข้อมูลไอคราวไปหน้าไอคราว
app.get('/get_records', async (req, res) => {
    try {
        // ดึง creditorId จากพารามิเตอร์ query
        const { creditorId } = req.query;

        // สร้างตัวกรองตาม creditorId ถ้ามี
        const filter = creditorId ? { creditorId } : {};

        // เรียงข้อมูลตาม record_date และ _id จากใหม่ไปเก่า
        const records = await iCloudRecord.find(filter)
            .sort({ record_date: -1, _id: -1 })  // เรียงตาม record_date และ _id
            .populate('loan');

        // คำนวณจำนวนเอกสารใน LoanInformation ที่ตรงกับ phoneicloud หรือ email_icloud
        const recordsWithLoanCount = await Promise.all(records.map(async (record) => {
            const loanCount = await LoanInformation.countDocuments({
                $or: [
                    { phoneicloud: record.phone_number },
                    { email_icloud: record.user_email }
                ]
            });
            return { ...record.toObject(), loanCount };
        }));

        res.json(recordsWithLoanCount);
    } catch (error) {
        console.error('Failed to fetch iCloud Records:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// ส่งข้อมูลสัญญาที่ใช้ไอคราวแต่ละไอคราว
app.get('/loan_with_icloud', async (req, res) => {
    try {
        const { phone_number, user_email, creditorId } = req.query; // อ่านพารามิเตอร์จาก query string
        console.log('Received query parameters:', { phone_number, user_email, creditorId }); // ตรวจสอบค่าพารามิเตอร์ที่รับ

        const query = {};
        if (phone_number) query['phoneicloud'] = phone_number;
        if (user_email) query['email_icloud'] = user_email;
        if (creditorId) query['creditorId'] = creditorId; // เพิ่มการกรองตาม creditorId

        console.log('Query used for finding records:', query); // ตรวจสอบ query ที่ใช้ในการค้นหา

        // ค้นหาข้อมูล LoanInformation โดยรวมข้อมูลที่เกี่ยวข้องใน icloud_records
        const loans = await LoanInformation.find(query)
            .populate({
                path: 'icloud_records', // อ้างอิงถึงฟิลด์ที่อ้างอิง iCloudRecord
                select: 'icloudField1 icloudField2' // เลือกฟิลด์ที่ต้องการจาก iCloudRecord
            })
            .exec();

        res.json(loans);
    } catch (error) {
        console.error('Error fetching loan information:', error);
        res.status(500).json({ error: 'Failed to fetch loan information' });
    }
});



//ลบสัญญาเเต่ละไอคราว
// ลบค่า phoneicloud และ email_icloud จากเอกสารใน LoanInformation
app.delete('/delete_record2/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // อัปเดตเอกสารเพื่อทำการลบฟิลด์ phoneicloud และ email_icloud
        const result = await LoanInformation.findByIdAndUpdate(
            id,
            { $unset: { phoneicloud: "", email_icloud: "" } },
            { new: true } // ส่งคืนเอกสารที่อัปเดตแล้ว
        );

        if (result) {
            res.status(200).json({ message: 'Fields removed successfully', updatedRecord: result });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Failed to update record' });
    }
});




// ลบข้อมูลไอคราว
app.delete('/delete_record/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ค้นหาและลบข้อมูลใน MongoDB โดยใช้ ID
        const deletedRecord = await iCloudRecord.findByIdAndDelete(id);

        if (deletedRecord) {
            res.status(200).send('iCloud Record deleted successfully');
        } else {
            res.status(404).send('iCloud Record not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete iCloud Record');
    }
});


// เเสดงข้อมูลไอคราวตามid
app.get('/api/icloudRecordd/:id', async (req, res) => {
    try {
        const recordId = req.params.id;
        const record = await iCloudRecord.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json(record);
    } catch (error) {
        console.error('Failed to fetch record:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// ดึงข้อมูล phone_number ของ iCloud records โดยไม่ให้ซ้ำกัน ไปหน้าบันทึกสัญญา
app.get('/api/phone_number', async (req, res) => {
    try {
        const { creditorId } = req.query; // ดึงค่า creditorId จาก query parameters

        // สร้าง query สำหรับการกรองข้อมูลตาม creditorId
        const query = creditorId ? { creditorId } : {};

        const phoneNumbers = await iCloudRecord.aggregate([
            { $match: query }, // กรองข้อมูลตาม creditorId
            {
                $group: {
                    _id: '$phone_number',
                }
            },
            {
                $project: {
                    _id: 0,
                    phone_number: '$_id'
                }
            }
        ]);
        res.json(phoneNumbers);
    } catch (err) {
        console.error('Failed to fetch phone numbers from iCloud Records:', err);
        res.status(500).send('Failed to fetch phone numbers from iCloud Records');
    }
});



// ดึงข้อมูล user_email ของ iCloud records ไปหน้าบันทึกสัญญา
app.get('/api/user_email', async (req, res) => {
    try {
        const { phone_number, creditorId } = req.query; // ดึง phone_number และ creditorId จาก query string

        // กำหนดเงื่อนไขการค้นหาตาม phone_number และ creditorId
        const query = { creditorId }; // ใช้ creditorId สำหรับการค้นหา

        if (phone_number) {
            query.phone_number = phone_number;
        }

        const userEmails = await iCloudRecord.find(query, 'phone_number user_email');
        res.json(userEmails);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch user emails from iCloud Records');
    }
});



// ดึงข้อมูลรหัสไอคราวล่าสุด ไปหน้าบันทึกสัญญา
app.get('/api/icloud_password/:phoneNumber/:userEmail', async (req, res) => {
    try {
        const { phoneNumber, userEmail } = req.params;
        const { creditorId } = req.query; // ดึง creditorId จาก query string

        // ค้นหา iCloudRecord ที่มี phoneNumber, userEmail และ creditorId ที่ระบุ
        const record = await iCloudRecord.findOne({
            phone_number: phoneNumber,
            user_email: userEmail,
            creditorId: creditorId // เพิ่มเงื่อนไขการค้นหาตาม creditorId
        });

        if (record) {
            // ถ้าพบเอกสาร ส่งข้อมูล icloud_password กลับไปยัง client
            res.send(record.icloud_password);
        } else {
            // ถ้าไม่พบเอกสาร ส่งข้อความแจ้งเตือน
            res.status(404).send('iCloud Record not found for the given phone number, email, and creditor ID');
        }
    } catch (error) {
        console.error('Error fetching iCloud password:', error);
        res.status(500).send('Failed to fetch iCloud password');
    }
});


// อัปเดตรหัสไอคราว ในหน้าบันทึกสัญญา
app.post('/updateIcloudPassword', async (req, res) => {
    const { phoneicloud, email_icloud, code_icloud } = req.body; // ดึงข้อมูลจาก body
    const creditorId = req.query.creditorId; // ดึง creditorId จาก query string

    console.log('รับข้อมูลจาก Frontend:', req.body, 'creditorId:', creditorId);

    try {
        const updatedRecord = await iCloudRecord.findOneAndUpdate(
            { phone_number: phoneicloud, user_email: email_icloud, creditorId: creditorId }, // ใช้ creditorId ในการค้นหา
            { icloud_password: code_icloud },
            { new: true, upsert: false } // ไม่สร้างเอกสารใหม่ถ้าไม่มี
        );

        if (updatedRecord) {
            console.log('อัปเดตสำเร็จ:', updatedRecord);
            res.status(200).json(updatedRecord);
        } else {
            console.error('ไม่พบเอกสารที่ต้องการอัปเดต');
            res.status(404).json({ error: 'ไม่พบเอกสารที่ต้องการอัปเดต' });
        }
    } catch (error) {
        console.error('Error updating iCloud password:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' });
    }
});









// กำไรขาดทุนส่วนบุคคล
app.get('/api/loaninfo/:id_card_number', async (req, res) => {
    const id_card_number = req.params.id_card_number;
    const creditorId = req.query.creditorId; // ดึง creditorId จาก query string
    
    try {
        console.log(`Received request for id_card_number: ${id_card_number}, creditorId: ${creditorId}`);
        
        // ค้นหาเอกสาร LoanInformation โดยใช้ id_card_number และ creditorId
        const loanDocuments = await LoanInformation.find({ id_card_number, creditorId }).sort({ contract_number: -1 }).exec();
        console.log('Loan documents found:', loanDocuments);
        
        const uniqueContractNumbers = [...new Set(loanDocuments.map(doc => doc.contract_number))];
        console.log('Unique contract numbers:', uniqueContractNumbers);
      
        const results = [];
        for (const contract_number of uniqueContractNumbers) {
            console.log(`Processing contract_number: ${contract_number}`);
            
            const totalRefund = await Refund.aggregate([
                { $match: { id_card_number: id_card_number, contract_number: contract_number, creditorId: creditorId } },
                {
                    $group: {
                        _id: null,
                        total_refund2: { $sum: { $toDouble: '$total_refund2' } }
                    }
                }
            ]);
            console.log(`Total refund for contract_number ${contract_number}: ${totalRefund.length > 0 ? totalRefund[0].total_refund2 : 0}`);
            
            const refundDocuments = await Refund.find({ id_card_number, contract_number, creditorId });
            console.log(`Refund documents for contract_number ${contract_number}:`, refundDocuments);
          
            const initialLoan = await LoanInformation.findOne({ id_card_number, contract_number, bill_number: 1, creditorId });
            
            // แปลงค่า Recommended ให้เป็นตัวเลข
            const recommended = initialLoan && !isNaN(parseFloat(initialLoan.Recommended))
                ? parseFloat(initialLoan.Recommended)
                : 0;
            console.log(`Recommended for contract_number ${contract_number}:`, recommended);
        
            const profitSharings = await ProfitSharing.find({ id_card_number, contract_number, creditorId });
            console.log(`Profit sharing documents for contract_number ${contract_number}:`, profitSharings);
            
            const totalShare = profitSharings.reduce((total, doc) => total + parseFloat(doc.totalShare), 0);
            console.log(`Total share for contract_number ${contract_number}: ${totalShare}`);
        
            const finalStatus = await LoanInformation.findOne({ id_card_number, contract_number, creditorId }).sort({ bill_number: -1 }).exec();
            console.log(`Final status for contract_number ${contract_number}:`, finalStatus);

            let statusMessage = '';
            if (finalStatus && finalStatus.status === "<span style='color: green;'>ชำระครบ</span>") {
                statusMessage = "<span style='color: green;'>จ่ายครบแล้ว</span>";
            } else {
                statusMessage = "<span style='color: red;'>จ่ายยังไม่ครบ</span>";
            }
        
            results.push({
                contract_number,
                total_refund2: totalRefund.length > 0 ? totalRefund[0].total_refund2 : 0,
                refundDocuments,
                principal: initialLoan ? parseFloat(initialLoan.principal) : 0,
                recommended,
                totalShare,
                status: statusMessage,
                netProfit: 0
            });
        }
      
        console.log('Final results:', results);
        res.json(results);
    } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).send(err.message);
    }
});







//เพิ่มรายได้
app.post('/save-income', upload.single('income_receipt'), async (req, res) => {
    try {
        // ดึงข้อมูลจากแบบฟอร์ม
        const { creditorId, record_date, income_amount, details } = req.body;

        // ถ้ามีไฟล์ที่อัปโหลด
        let incomeReceiptFile = null;
        if (req.file) {
            // อ่านไฟล์และแปลงเป็น Base64
            const fileData = req.file.buffer.toString('base64');
            incomeReceiptFile = new File({
                name: req.file.originalname,
                data: fileData,
                mimetype: req.file.mimetype
            });

            // บันทึกไฟล์ลงในฐานข้อมูล
            await incomeReceiptFile.save();
        }

        // สร้าง instance ใหม่ของ Income
        const newIncome = new Income({
            creditorId:creditorId,
            record_date: record_date, // แปลงวันที่เป็น Date object
            income_amount: parseFloat(income_amount), // แปลงยอดรายได้เป็น Number
            details: details, // รายละเอียด
            income_receipt_path: incomeReceiptFile ? [incomeReceiptFile._id] : [] // เก็บ ObjectId ของไฟล์ที่บันทึก
        });

        // บันทึกข้อมูลลงฐานข้อมูล
        await newIncome.save();

        // ส่งข้อมูลกลับเป็น JSON response
        res.redirect('/ตารางรายได้ค่าใช้จ่ายเงินทุน.html');
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ', err);
        res.status(500).json({ error: 'พบข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});


//เพิ่มค่าใช้จ่าย
app.post('/save-expense', upload.single('expense_receipt'), async (req, res) => {
    try {
        // ดึงข้อมูลจากแบบฟอร์ม
        const { creditorId, expense_date, expense_amount, details } = req.body;

        // ถ้ามีไฟล์ที่อัปโหลด
        let expenseReceiptFile = null;
        if (req.file) {
            // แปลงไฟล์เป็น Base64
            const fileData = req.file.buffer.toString('base64');
            expenseReceiptFile = new File({
                name: req.file.originalname,
                data: fileData,
                mimetype: req.file.mimetype
            });

            // บันทึกไฟล์ลงในฐานข้อมูล
            await expenseReceiptFile.save();
        }

        // สร้าง instance ใหม่ของ Expense
        const newExpense = new Expense({
            creditorId:creditorId,
            expense_date: expense_date, // แปลงวันที่เป็น Date object (หากจำเป็น)
            expense_amount: parseFloat(expense_amount), // แปลงยอดค่าใช้จ่ายเป็น Number
            details: details, // รายละเอียด
            expense_receipt_path: expenseReceiptFile ? [expenseReceiptFile._id] : [] // เก็บ ObjectId ของไฟล์ที่บันทึก
        });

        // บันทึกข้อมูลลงฐานข้อมูล
        await newExpense.save();

        // ส่งข้อมูลกลับเป็น JSON response
        res.redirect('/ตารางรายได้ค่าใช้จ่ายเงินทุน.html');
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลค่าใช้จ่าย: ', err);
        res.status(500).json({ error: 'พบข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});



//เพิ่มเงินทุน
app.post('/save-capital', upload.single('capital_receipt'), async (req, res) => {
    try {
        // ดึงข้อมูลจากแบบฟอร์ม
        const { creditorId, capital_date, capital_amount, details } = req.body;

        let capitalReceiptFile = null;
        if (req.file) {
            // อ่านไฟล์และแปลงเป็น Base64
            const fileData = req.file.buffer.toString('base64');
            capitalReceiptFile = new File({
                name: req.file.originalname,
                data: fileData,
                mimetype: req.file.mimetype
            });

            // บันทึกไฟล์ลงในฐานข้อมูล
            await capitalReceiptFile.save();
        }

        // สร้าง instance ใหม่ของ Capital
        const newCapital = new Capital({
            creditorId:creditorId,
            capital_date: capital_date, // แปลงวันที่เป็น Date object
            capital_amount: parseFloat(capital_amount), // แปลงยอดเงินทุนเป็น Number
            details: details, // รายละเอียด
            capital_receipt_path: capitalReceiptFile ? [capitalReceiptFile._id] : [] // เก็บ ObjectId ของไฟล์ที่บันทึก
        });

        // บันทึกข้อมูลลงฐานข้อมูล
        await newCapital.save();

        // ส่งข้อมูลกลับเป็น JSON response
        res.redirect('/ตารางรายได้ค่าใช้จ่ายเงินทุน.html');
    } catch (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลเงินทุน: ', err);
        res.status(500).json({ error: 'พบข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});



//ปล่อยยอดเงินต้นหน้ารายงานผล
app.get('/getLoanInformation1', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let loanData = await LoanInformation.find({ bill_number: 1, creditorId }, 'loanDate principal');
        loanData = loanData.filter(loan => loan.principal !== 0);
        res.json(loanData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching loan information' });
    }
});

//ค่าเเนะนำหน้ารายงานผล
app.get('/getLoanInformation2', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let loanData = await LoanInformation.find({ bill_number: 1, creditorId }, 'loanDate Recommended');
        loanData = loanData.filter(loan => loan.Recommended !== 0);
        res.json(loanData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching loan information' });
    }
});

//คืนเงินต้นหน้ารายงานผล
app.get('/getRefundInformation1', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let refundData = await Refund.find({ creditorId }, 'refund_principal return_date');
        refundData = refundData.filter(refund => refund.refund_principal !== 0);
        res.json(refundData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching refund information' });
    }
});

//คืนดอกเบี้ยหน้ารายงานผล
app.get('/getRefundInformation2', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let refunds = await Refund.find({ creditorId }, 'refund_interest return_date');
        refunds = refunds.filter(refund => refund.refund_interest !== 0);
        res.json(refunds);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching refund information' });
    }
});

//ค่าทวงหน้ารายงานผล
app.get('/getRefunds', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let refundData = await Refund.find({ creditorId }, 'debtAmount return_date');
        refundData = refundData.filter(refund => refund.debtAmount !== 0);
        res.json(refundData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching refund data' });
    }
});

//ส่วนเเบ่งหน้ารายงานผล
app.get('/getProfitSharings', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let profitSharings = await ProfitSharing.find({ creditorId }, 'totalShare returnDate');
        profitSharings = profitSharings.filter(sharing => sharing.totalShare !== 0);
        res.json(profitSharings);
    } catch (err) {
        console.error('Error fetching profit sharings:', err);
        res.status(500).json({ error: 'Error fetching profit sharings' });
    }
});

//ค่ายึดทรัพย์หน้ารายงานผล
app.get('/getSeizures', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let seizures = await Seizure.find({ creditorId }, 'seizureCost seizureDate');
        seizures = seizures.filter(seizure => seizure.seizureCost !== 0);
        res.json(seizures);
    } catch (err) {
        console.error('Error fetching seizures:', err);
        res.status(500).json({ error: 'Error fetching seizures' });
    }
});

//ขายทรัพย์หน้ารายงานผล
app.get('/getSales', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let sales = await Sale.find({ creditorId }, 'sellamount sell_date');
        sales = sales.filter(sale => sale.sellamount !== 0);
        res.json(sales);
    } catch (err) {
        console.error('Error fetching sales:', err);
        res.status(500).json({ error: 'Error fetching sales' });
    }
});

//เพิ่มค่าใช้จ่ายหน้ารายงานผล
app.get('/getExpenses', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let expenses = await Expense.find({ creditorId }, 'expense_date expense_amount details');
        expenses = expenses.filter(expense => expense.expense_amount !== 0);
        res.json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});

//เพิ่มรายได้หน้ารายงานผล
app.get('/getIncomes', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let incomes = await Income.find({ creditorId }, 'record_date income_amount details');
        incomes = incomes.filter(income => income.income_amount !== 0);
        res.json(incomes);
    } catch (err) {
        console.error('Error fetching incomes:', err);
        res.status(500).json({ error: 'Error fetching incomes' });
    }
});

//เพิ่มเงินทุนหน้ารายงานผล
app.get('/getCapitals', async (req, res) => {
    try {
        const { creditorId } = req.query;
        let capitals = await Capital.find({ creditorId }, 'capital_date capital_amount details');
        capitals = capitals.filter(capital => capital.capital_amount !== 0);
        res.json(capitals);
    } catch (err) {
        console.error('Error fetching capitals:', err);
        res.status(500).json({ error: 'Error fetching capitals' });
    }
});


// เส้นทางแสดงข้อมูลรายได้ ค่าใช้จ่าย และเงินทุน
app.get('/api/get-all-data', async (req, res) => {
    const { creditorId } = req.query; // ดึง creditorId จาก query string
    
    try {
        // ตรวจสอบว่ามี creditorId หรือไม่
        if (!creditorId) {
            return res.status(400).json({ error: 'creditorId is required' });
        }
        
        // ดึงข้อมูลจากคอลเลกชันต่างๆ โดยกรองตาม creditorId
        const incomes = await Income.find({ creditorId }).populate('income_receipt_path').exec();
        const expenses = await Expense.find({ creditorId }).populate('expense_receipt_path').exec();
        const capitals = await Capital.find({ creditorId }).populate('capital_receipt_path').exec();

        // รวมข้อมูลทั้งหมดใน array เดียว
        const allData = [
            ...incomes.map(item => ({ ...item.toObject(), type: 'income' })),
            ...expenses.map(item => ({ ...item.toObject(), type: 'expense' })),
            ...capitals.map(item => ({ ...item.toObject(), type: 'capital' }))
        ];

        // เรียงลำดับข้อมูลทั้งหมดตาม _id ใหม่ไปเก่า
        allData.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

        // ส่งข้อมูลกลับเป็น JSON response
        res.json(allData);
    } catch (err) {
        console.error('Error fetching data: ', err);
        res.status(500).json({ error: 'Error fetching data' });
    }
});


//ลบข้อมูลรายได้ค่าใช้จ่ายเงินทุน
app.delete('/api/delete-item/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result;

        // ลองลบในทุกคอลเล็กชัน (income, expense, capital)
        result = await Income.findByIdAndDelete(id) ||
                 await Expense.findByIdAndDelete(id) ||
                 await Capital.findByIdAndDelete(id);

        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Item not found' });
        }
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ success: false, error: 'Error deleting item' });
    }
});

// ดูข้อมูลรายได้
app.get('/api/get-income5/:id', async (req, res) => {
    try {
        const incomeId = req.params.id;
        const income = await Income.findById(incomeId).populate('income_receipt_path');
        
        console.log('Income:', income); // Debugging line
        
        if (income) {
            if (income.income_receipt_path.length > 0) {
                const file = income.income_receipt_path[0];
                const imageData = `data:${file.mimetype};base64,${file.data.toString('base64')}`;
                income.income_receipt_url = imageData;
            }
            
            res.json(income);
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูล' });
        }
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error });
    }
});


// ดูข้อมูลค่าใช้จ่าย
app.get('/api/get-expense5/:id', async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findById(expenseId).populate('expense_receipt_path');

        if (!expense) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลค่าใช้จ่าย' });
        }

        // สร้าง URL สำหรับไฟล์ภาพ
        const expenseReceiptUrls = expense.expense_receipt_path.map(file => ({
            mimetype: file.mimetype,
            url: `data:${file.mimetype};base64,${file.data.toString('base64')}`
        }));

        res.json({
            expense_date: expense.expense_date,
            expense_amount: expense.expense_amount,
            details: expense.details,
            expense_receipt_path: expenseReceiptUrls
        });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error });
    }
});






// ดูข้อมูลเงินทุน
app.get('/api/get-capital/:id', async (req, res) => {
    try {
        const capitalId = req.params.id;
        const capital = await Capital.findById(capitalId).populate('capital_receipt_path');

        if (!capital) {
            return res.status(404).json({ message: 'Capital not found' });
        }

        // สร้างตัวแปรสำหรับไฟล์ภาพ
        const capitalReceiptPath = capital.capital_receipt_path.map(file => ({
            mimetype: file.mimetype,
            data: file.data.toString('base64') // แปลงข้อมูลเป็น base64
        }));

        res.json({
            capital_date: capital.capital_date,
            capital_amount: capital.capital_amount,
            details: capital.details,
            capital_receipt_path: capitalReceiptPath
        });
    } catch (error) {
        console.error('Error fetching capital:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





//เช็คเครดิต
app.get('/api/debtors-loans', async (req, res) => {
    try {
        const debtorInfo = await DebtorInformation.find().exec();
        const loanInfo = await LoanInformation.find().exec();

        // ใช้ Map เพื่อรวมข้อมูลจากทั้งสองคอลเลกชัน
        const debtorMap = new Map();
        debtorInfo.forEach(debtor => debtorMap.set(debtor.id_card_number, debtor));

        // สร้างแผนที่ที่เก็บข้อมูลที่มี contract_number สูงสุดสำหรับแต่ละ id_card_number
        const maxContractsMap = new Map();

        loanInfo.forEach(loan => {
            const key = loan.id_card_number;
            if (!maxContractsMap.has(key)) {
                maxContractsMap.set(key, loan);
            } else {
                const existingLoan = maxContractsMap.get(key);
                if (loan.contract_number > existingLoan.contract_number ||
                    (loan.contract_number === existingLoan.contract_number && loan.bill_number > existingLoan.bill_number)) {
                    maxContractsMap.set(key, loan);
                }
            }
        });

        // รวมข้อมูลจากทั้งสองคอลเลกชัน
        const combinedData = Array.from(maxContractsMap.values()).map(loan => {
            const debtor = debtorMap.get(loan.id_card_number) || {};
            return {
                id_card_number: loan.id_card_number,
                first_name: debtor.fname || '',
                last_name: debtor.lname || '',
                principal: loan.principal || 0,
                interest: loan.totalInterest || 0,
                total_amount_due: loan.totalRefund || 0,
                status: loan.status || '',
                province: debtor.province || ''
            };
        });

        res.json(combinedData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Error fetching data' });
    }
});








//บันทึกสัญญาผ่อนทรัพย์
app.post('/AddLoanInformationx/submit', upload.fields([
    { name: 'asset_receipt_photo', maxCount: 1 },
    { name: 'icloud_asset_photo', maxCount: 1 },
    { name: 'refund_receipt_photo', maxCount: 1 },
    { name: 'Recommended_photo', maxCount: 1 },
    { name: 'contract', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            creditorId,
            manager,
            id_card_number,
            fname,
            lname,
            contract_number,
            bill_number = 1,
            loanType,
            loanDate,
            loanPeriod,
            returnDate,
            principal,
            interestRate,
            totalInterest,
            totalRefund,
            manager2,
            Recommended,
            store_assets,
            icloud_assets,
            phoneicloud,
            email_icloud,
            code_icloud,
            code_icloud2
        } = req.body;

        if (!id_card_number || !creditorId) {
            console.error('ID card number and creditorId are required');
            return res.status(400).json({ error: 'ID card number and creditorId are required' });
        }

        const debtor = await DebtorInformation.findOne({ id_card_number });
        if (!debtor) {
            console.error('Debtor not found');
            return res.status(404).json({ error: 'Debtor not found' });
        }

        const icloudRecords = await iCloudRecord.find({ 
            phone_number: phoneicloud,
            user_email: email_icloud
        });

        const files = req.files;
        const savedFiles = {};

        for (const [key, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray.length > 0) {
                const savedFile = await saveFile(fileArray[0]);
                savedFiles[key] = savedFile;
            }
        }

        let loanInfo = await LoanInformation.findOne({
            id_card_number,
            contract_number,
            bill_number
        });

        if (loanInfo) {
            Object.assign(loanInfo, {
                creditorId,
                manager,
                fname,
                lname,
                loanType,
                loanDate,
                loanPeriod,
                returnDate,
                principal,
                interestRate,
                totalInterest,
                totalRefund,
                manager2,
                Recommended,
                storeAssets: store_assets,
                icloudAssets: icloud_assets,
                phoneicloud,
                email_icloud,
                code_icloud,
                code_icloud2,
                debtor: debtor._id,
                icloud_records: icloudRecords.map(record => record._id)
            });

            for (const [key, file] of Object.entries(savedFiles)) {
                if (loanInfo[key]) {
                    loanInfo[key] = [file._id];
                }
            }

            await loanInfo.save();
        } else {
            loanInfo = new LoanInformation({
                creditorId,
                manager,
                id_card_number,
                fname,
                lname,
                contract_number,
                bill_number,
                loanType,
                loanDate,
                loanPeriod,
                returnDate,
                principal,
                interestRate,
                totalInterest,
                totalRefund,
                manager2,
                Recommended,
                storeAssets: store_assets,
                icloudAssets: icloud_assets,
                phoneicloud,
                email_icloud,
                code_icloud,
                code_icloud2,
                asset_receipt_photo: files['asset_receipt_photo'] ? [savedFiles['asset_receipt_photo']._id] : [],
                icloud_asset_photo: files['icloud_asset_photo'] ? [savedFiles['icloud_asset_photo']._id] : [],
                refund_receipt_photo: files['refund_receipt_photo'] ? [savedFiles['refund_receipt_photo']._id] : [],
                Recommended_photo: files['Recommended_photo'] ? [savedFiles['Recommended_photo']._id] : [],
                contract: files['contract'] ? [savedFiles['contract']._id] : [],
                debtor: debtor._id,
                icloud_records: icloudRecords.map(record => record._id)
            });

            const savedLoan = await loanInfo.save();

            await DebtorInformation.updateOne(
                { _id: debtor._id },
                { $push: { loans: savedLoan._id } }
            );
        }

        const response = await fetch('http://localhost:3000/api/calculate-and-save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_card_number, creditorId })
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Error calculating and saving loan data: ${responseText}`);
        }

        const data = await response.json();
        const redirectURL = `/สัญญา.html?id_card_number=${id_card_number}&fname=${fname}&lname=${lname}&manager=${manager}`;

        res.redirect(redirectURL);

    } catch (error) {
        console.error('Error during form submission:', error);
        res.status(500).json({ error: 'Error processing the form submission' });
    }
});

// กำหนดพอร์ตที่เซิร์ฟเวอร์จะใช้
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



mongoose.connect('mongodb://localhost:27017/bank', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
