const mongoose = require('mongoose');

//ยูสเจ้าหนี้
const creditorSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//ยูสลุกหนี้
const userSchema = new mongoose.Schema({
    id_card_number: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//ข้อมูลลูกหนี้เงินกู้
const debtorSchema = new mongoose.Schema({
    creditorId: String,
    manager: String,
    date: String,
    id_card_number: String,
    fname: String,
    lname: String,
    occupation: String,
    monthly_income_amount: String,
    seizable_assets_description: String,
    ig: String,
    facebook: String,
    line: String,
    phone: String,
    province: String,
    currentAddress: String,
    workOrStudyAddress: String,
    workOrStudyAddress2: String,
    grade: String,
    course: String,
    id_card_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    id_card_photo2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    current_address_map: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    work_address_map: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    student_record_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    timetable_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    loans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformation' }],
    refund: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Refund' }],
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharing'}]
    
});


// ตั้งค่า pre hook สำหรับ debtorSchema
debtorSchema.pre('findOneAndDelete', async function(next) {
    try {
        const debtorId = this.getQuery()["_id"];
        console.log(`Deleting debtor: ${debtorId}`);

        // ค้นหา loans ที่เชื่อมโยงกับ debtor นี้
        const loans = await LoanInformation.find({ debtor: debtorId });
        const loanIds = loans.map(loan => loan._id);

        // ลบ refund ที่เชื่อมโยงกับ loans เหล่านี้
        console.log(`Deleting refunds for loans: ${loanIds}`);
        const refunds = await Refund.find({ loan: { $in: loanIds } });
        const refundIds = refunds.map(refund => refund._id);

        // ลบไฟล์ที่เชื่อมโยงกับ refund เหล่านี้
        for (const refund of refunds) {
            const refundFileFields = ['refund_receipt_photo'];
            for (const field of refundFileFields) {
                const fileIds = refund[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for refund: ${refund._id}, field: ${field} with ids: ${fileIds}`);
                    await File.deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ refund ที่เชื่อมโยงกับ loans เหล่านี้
        await Refund.deleteMany({ loan: { $in: loanIds } });

        // ลบ profit sharings ที่เชื่อมโยงกับ refunds
        console.log(`Deleting profit sharings for refunds: ${refundIds}`);
        const profitSharings = await ProfitSharing.find({ refund: { $in: refundIds } });
        const profitSharingIds = profitSharings.map(profitSharing => profitSharing._id);

        // ลบไฟล์ที่เชื่อมโยงกับ profit sharings เหล่านี้
        for (const profitSharing of profitSharings) {
            const profitSharingFileFields = ['collectorReceiptPhoto', 'managerReceiptPhoto', 'receiverReceiptPhoto'];
            for (const field of profitSharingFileFields) {
                const fileIds = profitSharing[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for profit sharing: ${profitSharing._id}, field: ${field} with ids: ${fileIds}`);
                    await File.deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        await ProfitSharing.deleteMany({ refund: { $in: refundIds } });

        // ลบ seizure ที่เชื่อมโยงกับ loans เหล่านี้
        console.log(`Deleting seizures for loans: ${loanIds}`);
        const seizures = await Seizure.find({ loan: { $in: loanIds } });
        const seizureIds = seizures.map(seizure => seizure._id);

        // ลบไฟล์ที่เชื่อมโยงกับ seizure เหล่านี้
        for (const seizure of seizures) {
            const seizureFileFields = ['assetPhoto', 'seizureCost2'];
            for (const field of seizureFileFields) {
                const fileIds = seizure[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for seizure: ${seizure._id}, field: ${field} with ids: ${fileIds}`);
                    await File.deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ sale ที่เชื่อมโยงกับ seizure เหล่านี้
        console.log(`Deleting sales for seizures: ${seizureIds}`);
        const sales = await Sale.find({ seizure_id: { $in: seizureIds } });
        const saleIds = sales.map(sale => sale._id);

        // ลบไฟล์ที่เชื่อมโยงกับ sale เหล่านี้
        for (const sale of sales) {
            const saleFileFields = ['sell_slip'];
            for (const field of saleFileFields) {
                const fileIds = sale[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for sale: ${sale._id}, field: ${field} with ids: ${fileIds}`);
                    await File.deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        await Sale.deleteMany({ seizure_id: { $in: seizureIds } });

        // ลบ seizure ที่เชื่อมโยงกับ loans เหล่านี้
        await Seizure.deleteMany({ loan: { $in: loanIds } });

        // ลบไฟล์ภาพที่เชื่อมโยงกับ loans เหล่านี้
        for (const loan of loans) {
            const loanFileFields = ['asset_receipt_photo', 'icloud_asset_photo', 'refund_receipt_photo', 'Recommended_photo', 'contract'];
            for (const field of loanFileFields) {
                const fileIds = loan[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for loan: ${loan._id}, field: ${field} with ids: ${fileIds}`);
                    await File.deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ loans ที่เชื่อมโยงกับ debtor นี้
        console.log(`Deleting loans for debtor: ${debtorId}`);
        await LoanInformation.deleteMany({ debtor: debtorId });

        // ค้นหาและลบไฟล์ภาพที่เชื่อมโยงกับ debtor
        const debtor = await DebtorInformation.findById(debtorId);
        const debtorFileFields = ['id_card_photo', 'id_card_photo2', 'current_address_map', 'work_address_map', 'student_record_photo', 'timetable_photo'];

        for (const field of debtorFileFields) {
            const fileIds = debtor[field];
            if (fileIds && fileIds.length > 0) {
                console.log(`Deleting files for field: ${field} with ids: ${fileIds}`);
                await File.deleteMany({ _id: { $in: fileIds } });
            }
        }

        // ลบ debtor
        next();
    } catch (err) {
        next(err);
    }
});





//สัญญาเงินกู้
const loanSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: false },
    id_card_number: { type: String, required: false },
    fname: { type: String, required: false },
    lname: { type: String, required: false },
    contract_number: { type: Number, required: false },
    bill_number: { type: Number, required: false },
    loanType:{ type: String, required: false },
    loanDate: { type: String, required: false },
    loanPeriod: { type: String, required: false },
    returnDate: { type: String, required: false },
    principal: { type: String, required: false }, // ควรใช้ Number แทน String => เงินต้น
    interestRate: { type: String, required: false }, // ควรใช้ Number แทน String => อัตราดอกเบี้ยต่อวัน
    totalInterest: { type: String, required: false }, // ควรใช้ Number แทน String => ดอกเบี้ย
    totalInterest2: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => ดอกปรับ
    totalInterest3: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => ดอกยกมา
    totalInterest4: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => รวมดอก
    totalRefund: { type: String, required: false }, // ควรใช้ Number แทน String =>  รวมเงินที่ต้องคืน
    manager2: { type: String, required: false },
    Recommended: { type: String, required: false },
    status: { type: String, required: false }, // เพิ่มฟิลด์ใหม่
    totalRepayment: { type: String, required: false },
    daysUntilReturn: { type: String, required: false },
    storeAssets: { type: String, required: false },
    icloudAssets: { type: String, required: false },
    phoneicloud: { type: String, required: false },
    email_icloud: { type: String, required: false },
    code_icloud: { type: String, required: false },
    code_icloud2: { type: String, required: false },
    asset_receipt_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    icloud_asset_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    refund_receipt_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    Recommended_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    contract: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'DebtorInformation', required: true },
    icloud_records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'iCloudRecord' }],
    refund: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Refund' }],
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharing'}]
});
loanSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        console.log('Preparing to delete loan with ID:', this._id);

        // หา Refund ที่อ้างอิงถึง Loan เพื่อหาว่า ProfitSharing อ้างอิงถึง Refund ไหน
        const refunds = await mongoose.model('Refund').find({ loan: this._id });
        console.log('Refunds found:', refunds);

        if (refunds.length > 0) {
            const refundIds = refunds.map(refund => refund._id);

            // ลบ ProfitSharing ที่อ้างอิงถึง Refund และไฟล์ที่เชื่อมโยง
            const profitSharings = await mongoose.model('ProfitSharing').find({ refund: { $in: refundIds } });
            console.log('ProfitSharings found:', profitSharings);

            if (profitSharings.length > 0) {
                const profitSharingFileIds = profitSharings.reduce((fileIds, profitSharing) => {
                    return fileIds.concat(profitSharing.collectorReceiptPhoto, profitSharing.managerReceiptPhoto, profitSharing.receiverReceiptPhoto);
                }, []);

                if (profitSharingFileIds.length > 0) {
                    const deleteProfitSharingFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: profitSharingFileIds } });
                    console.log('ProfitSharing files deleted:', deleteProfitSharingFilesResult);
                }

                const deleteProfitSharingResult = await mongoose.model('ProfitSharing').deleteMany({ refund: { $in: refundIds } });
                console.log('ProfitSharings deleted:', deleteProfitSharingResult);
            } else {
                console.log('No ProfitSharings found, skipping ProfitSharing deletion.');
            }

            // ลบไฟล์ที่เชื่อมกับ Refund นี้
            const refundFileIds = refunds.reduce((fileIds, refund) => {
                return fileIds.concat(refund.refund_receipt_photo);
            }, []);

            if (refundFileIds.length > 0) {
                const deleteRefundFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: refundFileIds } });
                console.log('Refund files deleted:', deleteRefundFilesResult);
            }

            // ลบ Refund ที่อ้างอิงถึง Loan
            const deleteRefundResult = await mongoose.model('Refund').deleteMany({ loan: this._id });
            console.log('Refunds deleted:', deleteRefundResult);
        } else {
            console.log('No refunds found, skipping ProfitSharing and Refund deletion.');
        }

        // ลบ Seizure ที่อ้างอิงถึง Loan
        const seizures = await mongoose.model('Seizure').find({ loan: this._id });
        console.log('Seizures found:', seizures);

        if (seizures.length > 0) {
            const seizureIds = seizures.map(seizure => seizure._id);

            // ลบ Sale ที่อ้างอิงถึง Seizure
            const sales = await mongoose.model('Sale').find({ seizure_id: { $in: seizureIds } });
            console.log('Sales found:', sales);

            if (sales.length > 0) {
                const saleFileIds = sales.reduce((fileIds, sale) => {
                    return fileIds.concat(sale.sell_slip);
                }, []);

                if (saleFileIds.length > 0) {
                    const deleteSaleFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: saleFileIds } });
                    console.log('Sale files deleted:', deleteSaleFilesResult);
                }

                const deleteSalesResult = await mongoose.model('Sale').deleteMany({ seizure_id: { $in: seizureIds } });
                console.log('Sales deleted:', deleteSalesResult);
            } else {
                console.log('No sales found, skipping Sale deletion.');
            }

            // ลบไฟล์ที่เชื่อมกับ Seizure
            const seizureFileIds = seizures.reduce((fileIds, seizure) => {
                return fileIds.concat(seizure.assetPhoto, seizure.seizureCost2);
            }, []);

            if (seizureFileIds.length > 0) {
                const deleteSeizureFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: seizureFileIds } });
                console.log('Seizure files deleted:', deleteSeizureFilesResult);
            }

            // ลบ Seizures
            const deleteSeizuresResult = await mongoose.model('Seizure').deleteMany({ loan: this._id });
            console.log('Seizures deleted:', deleteSeizuresResult);
        } else {
            console.log('No seizures found, skipping Seizure deletion.');
        }

        // ลบไฟล์ที่เชื่อมกับ Loan นี้
        const loanFileIds = this.asset_receipt_photo.concat(this.icloud_asset_photo, this.refund_receipt_photo, this.Recommended_photo, this.contract);
        if (loanFileIds.length > 0) {
            const deleteLoanFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: loanFileIds } });
            console.log('Loan files deleted:', deleteLoanFilesResult);
        } else {
            console.log('No files associated with loan, skipping file deletion.');
        }

        // ลบ Loan
        const deleteLoanResult = await mongoose.model('LoanInformation').deleteOne({ _id: this._id });
        console.log('Loan deleted:', deleteLoanResult);

        next();
    } catch (err) {
        console.error('Error in pre-deleteOne middleware:', err);
        next(err);
    }
});




//คืนเงินเงินกู้
const refundSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: true },
    id_card_number: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    contract_number: { type: String, required: true },
    bill_number: { type: String, required: true },
    principal: { type: String, required: false },
    totalInterest4: { type: String, required: false },
    totalRefund: { type: String, required: false },
    return_date: { type: String, required: true },
    refund_principal: { type: String, required: true },
    refund_interest: { type: String, required: true },
    total_refund2: { type: String, required: true },
    totalInterest5: { type: String, required: false },
    initial_profit: { type: String, required: false },// ส่วนเเบ่ง
    status: { type: String, required: false },
    refund_receipt_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    debtAmount: { type: String, required: false },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformation', required: true }, // อ้างอิงถึง loanSchema
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharing'}]
    
});

//ส่วนเเบ่งเงินกู้
const profitSharingSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: true },
    id_card_number: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    contract_number: { type: String, required: true },
    bill_number: { type: String, required: true },
    returnDate: { type: String, required: true },
    initialProfit: { type: Number, required: true },
    collectorName: { type: String },
    collectorSharePercent: { type: Number },
    collectorShare: { type: Number },
    collectorReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    initialProfit2: { type: Number },
    managerName: { type: String },
    managerSharePercent: { type: Number },
    managerShare: { type: Number },
    managerReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    receiverProfit: { type: Number },
    receiverName: { type: String },
    receiverSharePercent: { type: Number },
    receiverShare: { type: Number },
    receiverReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    totalShare: { type: Number },
    netProfit: { type: Number, required: true },
    originalStatus: { type: String },
    refund: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund', required: true }
});



// เเอดมิน
const managerSchema = new mongoose.Schema({
    creditorId: String,
    record_date: { type: String, required: false },
    id_card_number: { type: String, required: false },
    fname: { type: String, required: false },
    lname:  { type: String, required: false },
    nickname: { type: String, required: false },
    phone: { type: String, required: false },
    ig: { type: String, required: false },
    facebook: { type: String, required: false },
    line: { type: String, required: false },
    authentication: { type: String, required: false }
});


// ยึดทรัพย์
const seizureSchema = new mongoose.Schema({
    creditorId: String,
    id_card_number: { type: String, required: false },
    contract_number: { type: String, required: false },
    bill_number: { type: String, required: false },
    seizureDate: { type: String, required: false },
    principal: { type: String, required: false },
    collector_name: { type: String, required: false },
    seizureCost: { type: String, required: false },
    totalproperty: { type: String, required: false },
    seizedAssetType: { type: String, required: false },
    assetName: { type: String, required: false },
    assetDetails: { type: String, required: false },
    assetPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    seizureCost2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    status: { type: String, required: false },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformation', required: true } // อ้างอิงถึง loanSchema
});

//ขายทรัพย์
const saleSchema = new mongoose.Schema({
    creditorId: String,
    id_card_number: { type: String, required: true },
    contract_number: { type: String, required: true },
    bill_number: { type: String, required: true },
    totalproperty: { type: String, required: true },
    sell_date: { type: String, required: true },
    assetName: { type: String, required: true },
    assetDetails: { type: String, required: true },
    sellamount: { type: Number, required: true },
    netprofit: { type: Number, required: true },
    status: { type: String, required: false },
    sell_slip: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    seizure_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seizure', required: true } // ต้องการการอ้างอิงไปยัง Seizure
});


//ไอคราว
const iCloudRecordSchema = new mongoose.Schema({
    creditorId: String,
    record_date: { type: String, required: true },
    device_id: { type: String, required: true },
    phone_number: { type: String, required: true },
    user_email: { type: String, required: true },
    email_password: { type: String, required: true },
    icloud_password: { type: String, required: true },
    number_of_users: { type: Number, default: 0 },
    status: { type: String, required: false },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformation' }
});


//เพิ่มรายได้
const incomeSchema = new mongoose.Schema({
    creditorId: String,
    record_date: { type: String, required: false },
    income_amount: { type: Number, required: false },
    details: { type: String, required: false },
    income_receipt_path: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
    
});

//เพิ่มค่าใช้จ่าย
const expenseSchema = new mongoose.Schema({
    creditorId: String,
    expense_date: { type: String, required: true },
    expense_amount: { type: Number, required: true },
    details: { type: String, required: true },
    expense_receipt_path: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});



//เพิ่มเงินทุน
const capitalSchema = new mongoose.Schema({
    creditorId: String,
    capital_date: { type: String, required: true },
    capital_amount: { type: Number, required: true },
    details: { type: String, required: true },
    capital_receipt_path: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});


//ไฟล์ภาพ
const fileSchema = new mongoose.Schema({
    name: String,
    data: String, // Base64 data
    mimetype: String
});



//ข้อมูลลูกหนี้ผ่อนทรัพย์
const debtorxSchema = new mongoose.Schema({
    creditorId: String,
    manager: String,
    date: String,
    id_card_number: String,
    fname: String,
    lname: String,
    occupation: String,
    monthly_income_amount: String,
    seizable_assets_description: String,
    ig: String,
    facebook: String,
    line: String,
    phone: String,
    province: String,
    currentAddress: String,
    workOrStudyAddress: String,
    workOrStudyAddress2: String,
    grade: String,
    course: String,
    id_card_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    id_card_photo2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    current_address_map: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    work_address_map: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    student_record_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    timetable_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    loans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformationx' }],
    refund: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Refundx' }],
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharingx'}]
    
});


// ตั้งค่า pre hook สำหรับ debtorSchema
debtorxSchema.pre('findOneAndDelete', async function(next) {
    try {
        const debtorId = this.getQuery()["_id"];
        console.log(`Deleting debtor: ${debtorId}`);

        // ค้นหา loans ที่เชื่อมโยงกับ debtor นี้
        const loans = await mongoose.model('LoanInformationx').find({ debtor: debtorId });
        const loanIds = loans.map(loan => loan._id);

        // ลบ refund ที่เชื่อมโยงกับ loans เหล่านี้
        console.log(`Deleting refunds for loans: ${loanIds}`);
        const refunds = await mongoose.model('Refundx').find({ loan: { $in: loanIds } });
        const refundIds = refunds.map(refund => refund._id);

        // ลบไฟล์ที่เชื่อมโยงกับ refund เหล่านี้
        for (const refund of refunds) {
            const refundFileFields = ['refund_receipt_photo'];
            for (const field of refundFileFields) {
                const fileIds = refund[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for refund: ${refund._id}, field: ${field} with ids: ${fileIds}`);
                    await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ refund ที่เชื่อมโยงกับ loans เหล่านี้
        await mongoose.model('Refundx').deleteMany({ loan: { $in: loanIds } });

        // ลบ profit sharings ที่เชื่อมโยงกับ refunds
        console.log(`Deleting profit sharings for refunds: ${refundIds}`);
        const profitSharings = await mongoose.model('ProfitSharingx').find({ refund: { $in: refundIds } });
        const profitSharingIds = profitSharings.map(profitSharing => profitSharing._id);

        // ลบไฟล์ที่เชื่อมโยงกับ profit sharings เหล่านี้
        for (const profitSharing of profitSharings) {
            const profitSharingFileFields = ['collectorReceiptPhoto', 'managerReceiptPhoto', 'receiverReceiptPhoto'];
            for (const field of profitSharingFileFields) {
                const fileIds = profitSharing[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for profit sharing: ${profitSharing._id}, field: ${field} with ids: ${fileIds}`);
                    await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        await mongoose.model('ProfitSharingx').deleteMany({ refund: { $in: refundIds } });

        // ลบ seizure ที่เชื่อมโยงกับ loans เหล่านี้
        console.log(`Deleting seizures for loans: ${loanIds}`);
        const seizures = await mongoose.model('Seizurex').find({ loan: { $in: loanIds } });
        const seizureIds = seizures.map(seizure => seizure._id);

        // ลบไฟล์ที่เชื่อมโยงกับ seizure เหล่านี้
        for (const seizure of seizures) {
            const seizureFileFields = ['assetPhoto', 'seizureCost2'];
            for (const field of seizureFileFields) {
                const fileIds = seizure[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for seizure: ${seizure._id}, field: ${field} with ids: ${fileIds}`);
                    await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ sale ที่เชื่อมโยงกับ seizure เหล่านี้
        console.log(`Deleting sales for seizures: ${seizureIds}`);
        const sales = await mongoose.model('Salex').find({ seizure_id: { $in: seizureIds } });
        const saleIds = sales.map(sale => sale._id);

        // ลบไฟล์ที่เชื่อมโยงกับ sale เหล่านี้
        for (const sale of sales) {
            const saleFileFields = ['sell_slip'];
            for (const field of saleFileFields) {
                const fileIds = sale[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for sale: ${sale._id}, field: ${field} with ids: ${fileIds}`);
                    await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        await mongoose.model('Salex').deleteMany({ seizure_id: { $in: seizureIds } });

        // ลบ seizure ที่เชื่อมโยงกับ loans เหล่านี้
        await mongoose.model('Seizurex').deleteMany({ loan: { $in: loanIds } });

        // ลบไฟล์ภาพที่เชื่อมโยงกับ loans เหล่านี้
        for (const loan of loans) {
            const loanFileFields = ['asset_receipt_photo', 'icloud_asset_photo', 'refund_receipt_photo', 'Recommended_photo', 'contract'];
            for (const field of loanFileFields) {
                const fileIds = loan[field];
                if (fileIds && fileIds.length > 0) {
                    console.log(`Deleting files for loan: ${loan._id}, field: ${field} with ids: ${fileIds}`);
                    await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
                }
            }
        }

        // ลบ loans ที่เชื่อมโยงกับ debtor นี้
        console.log(`Deleting loans for debtor: ${debtorId}`);
        await mongoose.model('LoanInformationx').deleteMany({ debtor: debtorId });

        // ค้นหาและลบไฟล์ภาพที่เชื่อมโยงกับ debtor
        const debtor = await mongoose.model('DebtorInformationx').findById(debtorId);
        const debtorFileFields = ['id_card_photo', 'id_card_photo2', 'current_address_map', 'work_address_map', 'student_record_photo', 'timetable_photo'];

        for (const field of debtorFileFields) {
            const fileIds = debtor[field];
            if (fileIds && fileIds.length > 0) {
                console.log(`Deleting files for field: ${field} with ids: ${fileIds}`);
                await mongoose.model('File').deleteMany({ _id: { $in: fileIds } });
            }
        }

        // ลบ debtor
        console.log(`Deleting debtor: ${debtorId}`);
        next();
    } catch (err) {
        console.error('Error in pre-findOneAndDelete middleware:', err);
        next(err);
    }
});





//สัญญาผ่อนทรัพย์
const loanxSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: false },
    id_card_number: { type: String, required: false },
    fname: { type: String, required: false },
    lname: { type: String, required: false },
    contract_number: { type: Number, required: false },
    bill_number: { type: Number, required: false },
    loanType:{ type: String, required: false },
    loanDate: { type: String, required: false },
    loanPeriod: { type: String, required: false },
    returnDate: { type: String, required: false },
    principal2: { type: String, required: false },
    principal: { type: String, required: false }, // ควรใช้ Number แทน String => เงินต้น
    interestRate: { type: String, required: false }, // ควรใช้ Number แทน String => อัตราดอกเบี้ยต่อวัน
    totalInterest: { type: String, required: false }, // ควรใช้ Number แทน String => ดอกเบี้ย
    totalInterest2: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => ดอกปรับ
    totalInterest3: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => ดอกยกมา
    totalInterest4: { type: String, required: false }, // เพิ่มฟิลด์ใหม่ => รวมดอก
    totalRefund: { type: String, required: false }, // ควรใช้ Number แทน String =>  รวมเงินที่ต้องคืน
    manager2: { type: String, required: false },
    Recommended: { type: String, required: false },
    status: { type: String, required: false }, // เพิ่มฟิลด์ใหม่
    totalRepayment: { type: String, required: false },
    daysUntilReturn: { type: String, required: false },
    icloudAssets: { type: String, required: false },
    phoneicloud: { type: String, required: false },
    email_icloud: { type: String, required: false },
    code_icloud: { type: String, required: false },
    code_icloud2: { type: String, required: false },
    icloud_asset_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    refund_receipt_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    Recommended_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    contract: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'DebtorInformationx', required: true },
    icloud_records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'iCloudRecord' }],
    refund: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Refundx' }],
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharingx'}]
});

loanxSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        console.log('Preparing to delete loan with ID:', this._id);

        // หา Refund ที่อ้างอิงถึง Loan เพื่อหาว่า ProfitSharing อ้างอิงถึง Refund ไหน
        const refunds = await mongoose.model('Refundx').find({ loan: this._id });
        console.log('Refunds found:', refunds);

        if (refunds.length > 0) {
            const refundIds = refunds.map(refund => refund._id);

            // ลบ ProfitSharing ที่อ้างอิงถึง Refund และไฟล์ที่เชื่อมโยง
            const profitSharings = await mongoose.model('ProfitSharingx').find({ refund: { $in: refundIds } });
            console.log('ProfitSharings found:', profitSharings);

            if (profitSharings.length > 0) {
                const profitSharingFileIds = profitSharings.reduce((fileIds, profitSharing) => {
                    return fileIds.concat(profitSharing.collectorReceiptPhoto, profitSharing.managerReceiptPhoto, profitSharing.receiverReceiptPhoto);
                }, []);

                if (profitSharingFileIds.length > 0) {
                    const deleteProfitSharingFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: profitSharingFileIds } });
                    console.log('ProfitSharing files deleted:', deleteProfitSharingFilesResult);
                }

                const deleteProfitSharingResult = await mongoose.model('ProfitSharingx').deleteMany({ refund: { $in: refundIds } });
                console.log('ProfitSharings deleted:', deleteProfitSharingResult);
            } else {
                console.log('No ProfitSharings found, skipping ProfitSharing deletion.');
            }

            // ลบไฟล์ที่เชื่อมกับ Refund นี้
            const refundFileIds = refunds.reduce((fileIds, refund) => {
                return fileIds.concat(refund.refund_receipt_photo);
            }, []);

            if (refundFileIds.length > 0) {
                const deleteRefundFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: refundFileIds } });
                console.log('Refund files deleted:', deleteRefundFilesResult);
            }

            // ลบ Refund ที่อ้างอิงถึง Loan
            const deleteRefundResult = await mongoose.model('Refundx').deleteMany({ loan: this._id });
            console.log('Refunds deleted:', deleteRefundResult);
        } else {
            console.log('No refunds found, skipping ProfitSharing and Refund deletion.');
        }

        // ลบ Seizure ที่อ้างอิงถึง Loan
        const seizures = await mongoose.model('Seizurex').find({ loan: this._id });
        console.log('Seizures found:', seizures);

        if (seizures.length > 0) {
            const seizureIds = seizures.map(seizure => seizure._id);

            // ลบ Sale ที่อ้างอิงถึง Seizure
            const sales = await mongoose.model('Salex').find({ seizure_id: { $in: seizureIds } });
            console.log('Sales found:', sales);

            if (sales.length > 0) {
                const saleFileIds = sales.reduce((fileIds, sale) => {
                    return fileIds.concat(sale.sell_slip);
                }, []);

                if (saleFileIds.length > 0) {
                    const deleteSaleFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: saleFileIds } });
                    console.log('Sale files deleted:', deleteSaleFilesResult);
                }

                const deleteSalesResult = await mongoose.model('Salex').deleteMany({ seizure_id: { $in: seizureIds } });
                console.log('Sales deleted:', deleteSalesResult);
            } else {
                console.log('No sales found, skipping Sale deletion.');
            }

            // ลบไฟล์ที่เชื่อมกับ Seizure
            const seizureFileIds = seizures.reduce((fileIds, seizure) => {
                return fileIds.concat(seizure.assetPhoto, seizure.seizureCost2);
            }, []);

            if (seizureFileIds.length > 0) {
                const deleteSeizureFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: seizureFileIds } });
                console.log('Seizure files deleted:', deleteSeizureFilesResult);
            }

            // ลบ Seizures
            const deleteSeizuresResult = await mongoose.model('Seizurex').deleteMany({ loan: this._id });
            console.log('Seizures deleted:', deleteSeizuresResult);
        } else {
            console.log('No seizures found, skipping Seizure deletion.');
        }

        // ลบไฟล์ที่เชื่อมกับ Loan นี้
        const loanFileIds = this.asset_receipt_photo.concat(this.icloud_asset_photo, this.refund_receipt_photo, this.Recommended_photo, this.contract);
        if (loanFileIds.length > 0) {
            const deleteLoanFilesResult = await mongoose.model('File').deleteMany({ _id: { $in: loanFileIds } });
            console.log('Loan files deleted:', deleteLoanFilesResult);
        } else {
            console.log('No files associated with loan, skipping file deletion.');
        }

        // ลบ Loan
        const deleteLoanResult = await mongoose.model('LoanInformationx').deleteOne({ _id: this._id });
        console.log('Loan deleted:', deleteLoanResult);

        next();
    } catch (err) {
        console.error('Error in pre-deleteOne middleware:', err);
        next(err);
    }
});




//คืนเงินผ่อนทรัพย์
const refundxSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: true },
    id_card_number: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    contract_number: { type: String, required: true },
    bill_number: { type: String, required: true },
    principal: { type: String, required: false },
    totalInterest4: { type: String, required: false },
    totalRefund: { type: String, required: false },
    return_date: { type: String, required: true },
    refund_principal: { type: String, required: true },
    refund_interest: { type: String, required: true },
    total_refund2: { type: String, required: true },
    totalInterest5: { type: String, required: false },
    initial_profit: { type: String, required: false },// ส่วนเเบ่ง
    status: { type: String, required: false },
    refund_receipt_photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    debtAmount: { type: String, required: false },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanInformationx', required: true }, // อ้างอิงถึง loanSchema
    profitSharing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profitsharingx'}]
    
});

//ส่วนเเบ่งผ่อนทรัพย์
const profitSharingxSchema = new mongoose.Schema({
    creditorId: String,
    manager: { type: String, required: true },
    id_card_number: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    contract_number: { type: String, required: true },
    bill_number: { type: String, required: true },
    returnDate: { type: String, required: true },
    initialProfit: { type: Number, required: true },
    collectorName: { type: String },
    collectorSharePercent: { type: Number },
    collectorShare: { type: Number },
    collectorReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    initialProfit2: { type: Number },
    managerName: { type: String },
    managerSharePercent: { type: Number },
    managerShare: { type: Number },
    managerReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    receiverProfit: { type: Number },
    receiverName: { type: String },
    receiverSharePercent: { type: Number },
    receiverShare: { type: Number },
    receiverReceiptPhoto: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    totalShare: { type: Number },
    netProfit: { type: Number, required: true },
    originalStatus: { type: String },
    refund: { type: mongoose.Schema.Types.ObjectId, ref: 'Refundx', required: true }
});


// กำหนดโมเดล Mongoose สำหรับแต่ละ Schema
const Creditor = mongoose.model('Creditor', creditorSchema);
const User = mongoose.model('User', userSchema);
const DebtorInformation = mongoose.model('DebtorInformation', debtorSchema);
const LoanInformation = mongoose.model('LoanInformation', loanSchema);
const Refund = mongoose.model('Refund', refundSchema);
const ProfitSharing = mongoose.model('ProfitSharing', profitSharingSchema);
const Manager = mongoose.model('Manager', managerSchema);
const Seizure = mongoose.model('Seizure', seizureSchema);
const Sale = mongoose.model('Sale', saleSchema);
const iCloudRecord = mongoose.model('iCloudRecord', iCloudRecordSchema);
const Income = mongoose.model('Income', incomeSchema);
const Expense = mongoose.model('expense', expenseSchema);
const Capital = mongoose.model('Capital', capitalSchema);
const File = mongoose.model('File', fileSchema);
const DebtorInformationx = mongoose.model('DebtorInformationx', debtorxSchema);
const LoanInformationx = mongoose.model('LoanInformationx', loanxSchema);
const Refundx = mongoose.model('Refundx', refundxSchema);
const ProfitSharingx = mongoose.model('ProfitSharingx', profitSharingxSchema);



// ส่งออกโมเดล
module.exports = { DebtorInformation, LoanInformation, Refund, ProfitSharing, Manager, Seizure, Sale, 
    iCloudRecord, Income, Expense, Capital, File, Creditor, User, DebtorInformationx, LoanInformationx, Refundx, ProfitSharingx, };
