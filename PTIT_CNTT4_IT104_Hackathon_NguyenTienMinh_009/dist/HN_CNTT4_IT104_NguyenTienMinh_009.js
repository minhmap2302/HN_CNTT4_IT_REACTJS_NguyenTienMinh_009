"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Course {
    constructor(courseId, courseName, price, duration) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.price = price;
        this.duration = duration;
        this.students = 0;
    }
    displayCourse() {
        console.log(`#${this.courseId} | ${this.courseName} | Gia: ${this.price} | Thoi luong: ${this.duration} | Hoc vien: ${this.students}`);
    }
    getCourse(discount) {
        this.students++;
        let cost = this.price;
        if (discount)
            cost = cost * (1 - discount / 100);
        return `Mua khoa hoc ${this.courseName} voi gia ${cost}`;
    }
}
class FreeCourse extends Course {
    constructor(courseId, courseName, duration) {
        super(courseId, courseName, 0, duration);
    }
    getCertificate() {
        return "Khoa hoc mien phi khong co chung chi";
    }
    getRefundPolicy() {
        return "Khong co chinh sach hoan tien";
    }
}
class PaidCourse extends Course {
    constructor(courseId, courseName, price, duration) {
        super(courseId, courseName, price, duration);
    }
    getCertificate() {
        return `Chung chi khoa hoc: ${this.courseName}`;
    }
    getRefundPolicy() {
        return this.duration < 2 ? "Hoan tien neu thoi gian hoc duoi 2 gio" : "Khong hoan tien neu thoi gian hoc >= 2 gio";
    }
}
class User {
    constructor(id, name, email, phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.purchasedCourses = [];
        this.discounts = [];
    }
    getDetails() {
        return `ID: ${this.id} | Ten: ${this.name} | Email: ${this.email} | SDT: ${this.phone}`;
    }
    buyCourse(courseId) {
        this.purchasedCourses.push(courseId);
    }
}
class CourseManager {
    constructor() {
        this.courses = [];
        this.users = [];
        this.discounts = [];
    }
    addCourse(type, name, price, duration) {
        let id = "C" + (this.courses.length + 1);
        let c;
        if (type === "free")
            c = new FreeCourse(id, name, duration);
        else
            c = new PaidCourse(id, name, price, duration);
        this.courses.push(c);
    }
    createUser(name, email, phone) {
        let id = "U" + (this.users.length + 1);
        let u = new User(id, name, email, phone);
        this.users.push(u);
    }
    createNewDiscount(code, value) {
        this.discounts.push({ code, value });
    }
    handleBuyCourse(userId, courseId) {
        let u = this.users.find(x => x.id === userId);
        let c = this.courses.find(x => x.courseId === courseId);
        if (!u || !c)
            return "Khong tim thay";
        let discountValue = 0;
        if (u.discounts.length > 0) {
            let owned = this.discounts.filter(d => u.discounts.includes(d.code));
            if (owned.length > 0) {
                let best = owned.reduce((max, cur) => cur.value > max.value ? cur : max);
                discountValue = best.value;
                u.discounts = u.discounts.filter(dc => dc !== best.code);
            }
        }
        let msg = c.getCourse(discountValue);
        u.buyCourse(c.courseId);
        return msg;
    }
    handleRefundCourse(userId, courseId) {
        let u = this.users.find(x => x.id === userId);
        let c = this.courses.find(x => x.courseId === courseId);
        if (!u || !c)
            return "Khong tim thay";
        if (c instanceof PaidCourse && c.duration < 2) {
            u.purchasedCourses = u.purchasedCourses.filter(pc => pc !== courseId);
            return "Da hoan tien khoa hoc";
        }
        return "Khong the hoan tien";
    }
    listCourses(numOfStudents) {
        let lst = this.courses;
        if (numOfStudents !== undefined)
            lst = lst.filter(c => c.students >= numOfStudents);
        lst.map(c => c.displayCourse());
    }
    showUserInformation(email) {
        let u = this.users.find(x => x.email === email);
        if (!u) {
            console.log("Khong tim thay");
            return;
        }
        console.log(u.getDetails());
        console.log("Khoa hoc da mua:", u.purchasedCourses.join(", "));
        console.log("Ma giam gia:", u.discounts.join(", "));
    }
    calculateTotalRevenue() {
        return this.courses.reduce((sum, c) => sum + c.price * c.students, 0);
    }
    giftDiscount(userId, code) {
        let u = this.users.find(x => x.id === userId);
        if (!u) {
            console.log("Khong tim thay nguoi dung");
            return;
        }
        let d = this.discounts.find(dd => dd.code === code);
        if (!d) {
            console.log("Khong tim thay ma giam gia");
            return;
        }
        u.discounts.push(code);
        console.log("Da tang ma giam gia");
    }
    getCertificate(userId) {
        let u = this.users.find(x => x.id === userId);
        if (!u) {
            console.log("Khong tim thay nguoi dung");
            return;
        }
        u.purchasedCourses.forEach(cid => {
            let c = this.courses.find(cc => cc.courseId === cid);
            if (c)
                console.log(c.getCertificate());
        });
    }
    getRefundPolicy(courseId) {
        let c = this.courses.find(cc => cc.courseId === courseId);
        if (!c) {
            console.log("Khong tim thay khoa hoc");
            return;
        }
        console.log(c.getRefundPolicy());
    }
}
const readline = require("readline");
function input(question) {
    let rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(res => rl.question(question, ans => {
        rl.close();
        res(ans);
    }));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let cm = new CourseManager();
        let ch;
        do {
            console.log("=== Quan ly khoa hoc online ===");
            console.log("1. Them nguoi dung");
            console.log("2. Them khoa hoc");
            console.log("3. Them ma giam gia");
            console.log("4. Mua khoa hoc");
            console.log("5. Hoan tien khoa hoc");
            console.log("6. Hien thi danh sach khoa hoc");
            console.log("7. Hien thi thong tin nguoi dung");
            console.log("8. Tinh tong doanh thu");
            console.log("9. Tang ma giam gia");
            console.log("10. Hien thi chung chi nguoi dung");
            console.log("11. Hien thi chinh sach hoan tien");
            console.log("12. Thoat");
            ch = parseInt(yield input("Chon: "));
            switch (ch) {
                case 1: {
                    let n = yield input("Ten: ");
                    let e = yield input("Email: ");
                    let p = yield input("SDT: ");
                    cm.createUser(n, e, p);
                    break;
                }
                case 2: {
                    let t = yield input("Loai (free/paid): ");
                    let name = yield input("Ten khoa hoc: ");
                    let price = 0;
                    if (t === "paid")
                        price = parseInt(yield input("Gia: "));
                    let dur = parseFloat(yield input("Thoi luong: "));
                    cm.addCourse(t, name, price, dur);
                    break;
                }
                case 3: {
                    let code = yield input("Ma: ");
                    let val = parseInt(yield input("Gia tri %: "));
                    cm.createNewDiscount(code, val);
                    break;
                }
                case 4: {
                    let uid = yield input("ID nguoi dung: ");
                    let cid = yield input("ID khoa hoc: ");
                    console.log(cm.handleBuyCourse(uid, cid));
                    break;
                }
                case 5: {
                    let uid = yield input("ID nguoi dung: ");
                    let cid = yield input("ID khoa hoc: ");
                    console.log(cm.handleRefundCourse(uid, cid));
                    break;
                }
                case 6: {
                    let num = yield input("Loc theo so hoc vien (bo trong neu khong): ");
                    cm.listCourses(num ? parseInt(num) : undefined);
                    break;
                }
                case 7: {
                    let email = yield input("Nhap email: ");
                    cm.showUserInformation(email);
                    break;
                }
                case 8: {
                    console.log("Tong doanh thu:", cm.calculateTotalRevenue());
                    break;
                }
                case 9: {
                    let uid = yield input("ID nguoi dung: ");
                    let code = yield input("Ma giam gia: ");
                    cm.giftDiscount(uid, code);
                    break;
                }
                case 10: {
                    let uid = yield input("ID nguoi dung: ");
                    cm.getCertificate(uid);
                    break;
                }
                case 11: {
                    let cid = yield input("ID khoa hoc: ");
                    cm.getRefundPolicy(cid);
                    break;
                }
                case 12: {
                    console.log("Tam biet");
                    break;
                }
                default:
                    console.log("Lua chon khong hop le!");
            }
        } while (ch !== 12);
    });
}
main();
