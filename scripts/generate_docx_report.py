import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DIAGRAMS_DIR = r"d:\personal-finance\docs\diagrams"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_styled_heading(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    run = h.runs[0]
    run.font.name = 'Times New Roman'
    if level == 1:
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(16, 44, 87) # Deep Navy
    elif level == 2:
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(28, 80, 140)
    elif level == 3:
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(40, 40, 40)
    return h

def add_body_p(doc, text, bold_prefix="", italic=False, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.2
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
    r_body = p.add_run(text)
    r_body.font.name = 'Times New Roman'
    r_body.font.size = Pt(12)
    r_body.italic = italic
    return p

def add_diagram(doc, img_name, caption):
    img_path = os.path.join(DIAGRAMS_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(6.2))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(10)
        r_cap = p_cap.add_run(caption)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.size = Pt(10.5)
        r_cap.font.italic = True
        r_cap.font.bold = True
        r_cap.font.color.rgb = RGBColor(50, 50, 50)

def add_code_box(doc, code_text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text)
    run.font.name = 'Consolas'
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def build_docx(output_path):
    doc = Document()

    # Configure Margins (Top/Bottom/Right: 2.5cm = 0.98 in, Left: 3cm = 1.18 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.98)
        section.bottom_margin = Inches(0.98)
        section.left_margin = Inches(1.18)
        section.right_margin = Inches(0.98)

    # ------------------ COVER PAGE ------------------
    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_univ.paragraph_format.space_after = Pt(2)
    r = p_univ.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(30)
    r = p_fac.add_run("KHOA HỆ THỐNG THÔNG TIN")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    p_title_pre = doc.add_paragraph()
    p_title_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title_pre.paragraph_format.space_after = Pt(6)
    r = p_title_pre.add_run("BÁO CÁO ĐỒ ÁN MÔN HỌC")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = RGBColor(100, 100, 100)

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(24)
    r = p_course.add_run("IS402 – HỆ THỐNG THÔNG TIN HỖ TRỢ RA QUYẾT ĐỊNH (DSS)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(16, 44, 87)

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_after = Pt(40)
    r = p_proj.add_run("ĐỀ TÀI:\nHỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN\nBẰNG TRÍ TUỆ NHÂN TẠO (AI-FDSS)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 76, 129)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.left_indent = Inches(1.0)
    p_meta.paragraph_format.space_after = Pt(6)
    p_meta.paragraph_format.line_spacing = 1.3
    
    r = p_meta.add_run("Giảng viên hướng dẫn: ")
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.font.bold = True
    r = p_meta.add_run("[Điền tên Giảng viên phụ trách môn học]\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(12)

    r = p_meta.add_run("Danh sách sinh viên thực hiện (Nhóm 5 thành viên):\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.font.bold = True
    
    members = [
        "1. Phạm Văn Long - Trưởng nhóm (Kiến trúc sư hệ thống, Electron IPC & CI/CD)",
        "2. [Họ và tên SV 2] - Kỹ sư Backend & Cơ sở dữ liệu MySQL",
        "3. [Họ và tên SV 3] - Kỹ sư Trí tuệ Nhân tạo & Thuật toán DSS (Gemini AI, RAG)",
        "4. [Họ và tên SV 4] - Kỹ sư Frontend (Nghiệp vụ Thu chi, Ví, Ngân sách)",
        "5. [Họ và tên SV 5] - Kỹ sư Frontend (Trực quan hóa Dữ liệu) & Đảm bảo chất lượng (QA)"
    ]
    for m in members:
        r = p_meta.add_run(f"   • {m}\n")
        r.font.name = 'Times New Roman'; r.font.size = Pt(11.5)

    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(50)
    r = p_foot.add_run("TP. HỒ CHÍ MINH, HỌC KỲ 1 / NĂM HỌC 2026 - 2027\n(Thời gian thực hiện: 03/10/2026 – 12/12/2026)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # ------------------ MỤC LỤC TỔNG THỂ ------------------
    add_styled_heading(doc, "MỤC LỤC BỘ HỒ SƠ BÁO CÁO", level=1)
    
    toc_items = [
        "LỜI MỞ ĐẦU & TÍNH CẤP THIẾT CỦA ĐỀ TÀI",
        "DANH MỤC THUẬT NGỮ & TỪ VIẾT TẮT",
        "CHƯƠNG 1: TỔNG QUAN, MỤC TIÊU & ĐẶC TẢ YÊU CẦU HỆ THỐNG (YÊU CẦU 1 & 2)",
        "  1.1 Bối cảnh thực tế & Tính cấp thiết",
        "  1.2 Mục tiêu của dự án (Mục tiêu tổng quát & Mục tiêu cụ thể)",
        "  1.3 Phạm vi của dự án (Chức năng In/Out-Scope, Đối tượng, Công nghệ, Thời gian)",
        "  1.4 Sơ đồ phân rã chức năng nghiệp vụ (BFD - Hình 1.1)",
        "  1.5 Bảng so sánh chức năng Quản lý (TPS) vs Hỗ trợ ra quyết định (DSS)",
        "  1.6 Sơ đồ Use Case tổng thể hệ thống (UCD - Hình 1.2) & Kịch bản tương tác",
        "CHƯƠNG 2: THIẾT KẾ LƯU ĐỒ QUY TRÌNH HỖ TRỢ RA QUYẾT ĐỊNH (FLOWCHARTS - YÊU CẦU 3)",
        "  2.1 Sơ đồ hoạt động tổng thể của toàn dự án (Overall Activity Workflow - Hình 2.1)",
        "  2.2 Quy trình Đánh giá sức khỏe tài chính & Khẩu vị rủi ro (Mô hình phạt lỗi)",
        "  2.3 Quy trình Quét & Phát hiện chi tiêu bất thường (Anomaly Detection)",
        "  2.4 Quy trình Dự báo dòng tiền tương lai (Time-Series Cashflow Forecasting)",
        "  2.5 Quy trình Mô phỏng kịch bản What-If & Duyệt quyết định 1-Click",
        "  2.6 Quy trình Trợ lý ảo AI Copilot tương tác chuyên sâu qua kỹ thuật RAG",
        "CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU & TRÍCH XUẤT SQL (YÊU CẦU 4 & 6)",
        "  3.1 Sơ đồ quan hệ thực thể (ERD 17 bảng trong MySQL 8.0 - Hình 3.1)",
        "  3.2 Từ điển dữ liệu chi tiết (Data Dictionary)",
        "  3.3 Các câu lệnh SQL đặc trưng phục vụ phân tích dữ liệu đa chiều",
        "  3.4 Cơ chế tự động khởi tạo CSDL & Schema khi triển khai sang máy mới (Zero-Config)",
        "CHƯƠNG 4: THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG & BÁO CÁO (GUI & REPORTS - YÊU CẦU 5 & 6)",
        "  4.1 Bố cục Trung tâm chỉ huy Dashboard (KPIs, Cảnh báo đỏ, Khuyến nghị vàng)",
        "  4.2 Module chuyên biệt: Dự báo Dòng tiền & Mô phỏng kịch bản What-If",
        "  4.3 Trợ lý AI Copilot Chatbot nổi toàn cục (Floating AI Widget)",
        "  4.4 Thiết kế 4 mẫu Báo cáo tài chính định kỳ & Chức năng xuất dữ liệu CSV",
        "CHƯƠNG 5: HIỆN THỰC HÓA MÃ NGUỒN, TÍCH HỢP AI & ĐÓNG GÓI (+ AI BONUS)",
        "  5.1 Sơ đồ kiến trúc tổng thể hệ thống (System Architecture - Hình 5.1)",
        "  5.2 Động cơ suy luận Trí tuệ Nhân tạo (Gemini API & Kỹ thuật RAG Finance)",
        "  5.3 Quy trình kiểm thử & Tự động hóa tích hợp liên tục (CI/CD GitHub Actions)",
        "  5.4 Đóng gói bộ cài đặt độc lập Windows (.exe Installer)",
        "CHƯƠNG 6: QUẢN LÝ DỰ ÁN THEO PHƯƠNG PHÁP LUẬN AGILE/SCRUM",
        "  6.1 Kế hoạch tiến độ 5 Sprint (10 tuần: 03/10/2026 – 12/12/2026)",
        "  6.2 Ma trận phân công trách nhiệm nhóm 5 thành viên (RACI Matrix)",
        "KẾT LUẬN & HƯỚNG PHÁT TRIỂN (EXPAND TO MOBILE)",
        "TÀI LIỆU THAM KHẢO & PHỤ LỤC HƯỚNG DẪN CÀI ĐẶT"
    ]

    for item in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(item)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(11.5)
        if item.startswith("CHƯƠNG") or item.startswith("LỜI") or item.startswith("KẾT") or item.startswith("DANH"):
            r.font.bold = True
            p.paragraph_format.space_before = Pt(4)

    doc.add_page_break()

    # ------------------ LỜI MỞ ĐẦU ------------------
    add_styled_heading(doc, "LỜI MỞ ĐẦU & TÍNH CẤP THIẾT CỦA ĐỀ TÀI", level=1)
    add_body_p(doc, "Trong thời đại kinh tế biến động nhanh và lạm phát gia tăng, việc quản lý tài chính cá nhân ngày càng trở thành một thách thức lớn đối với sinh viên, người mới đi làm và các hộ gia đình trẻ. Thiếu kiểm soát chi tiêu, không có quỹ dự phòng khẩn cấp và áp lực nợ nần là những vấn đề phổ biến dẫn đến khủng hoảng tài chính cá nhân.")
    add_body_p(doc, "Tuy nhiên, hầu hết các ứng dụng quản lý chi tiêu hiện nay trên thị trường (như Money Lover, Sổ Thu Chi MISA...) chỉ dừng lại ở vai trò là một 'cuốn sổ ghi chép điện tử thụ động' (Hệ thống Xử lý Giao dịch - TPS). Các ứng dụng này chỉ ghi nhận những gì đã xảy ra trong quá khứ mà hoàn toàn thiếu vắng khả năng: cảnh báo rủi ro kịp thời, dự báo dòng tiền tương lai và đề xuất các quyết định can thiệp tối ưu.")
    add_body_p(doc, "Xuất phát từ thực tế đó, trong khuôn khổ môn học IS402 – Hệ thống Thông tin Hỗ trợ Ra Quyết định (Decision Support Systems - DSS), nhóm đã nghiên cứu và phát triển đề tài: 'Hệ thống hỗ trợ ra quyết định tài chính cá nhân bằng Trí tuệ Nhân tạo' (AI-FDSS). Hệ thống kết hợp giữa mô hình định lượng truyền thống (Chuỗi thời gian Time-Series, Ma trận rủi ro) với Trí tuệ Nhân tạo tạo sinh tiên tiến (Google Gemini AI & RAG) để biến các con số khô khan thành những quyết định tài chính chuẩn xác chỉ với 1 cú nhấp chuột.")

    add_styled_heading(doc, "DANH MỤC THUẬT NGỮ & TỪ VIẾT TẮT", level=1)
    terms = [
        ("DSS", "Decision Support System - Hệ thống thông tin hỗ trợ ra quyết định."),
        ("TPS / MIS", "Transaction Processing System / Management Information System - Hệ thống xử lý giao dịch / Hệ thống thông tin quản lý."),
        ("AI-FDSS", "Personal Financial Decision Support System by AI - Tên đề tài hệ thống."),
        ("BFD", "Business Function Diagram - Sơ đồ phân rã chức năng nghiệp vụ."),
        ("UCD", "Use Case Diagram - Sơ đồ trường hợp sử dụng tổng thể."),
        ("ERD", "Entity Relationship Diagram - Sơ đồ quan hệ thực thể cơ sở dữ liệu."),
        ("RAG", "Retrieval-Augmented Generation - Kỹ thuật tăng cường truy xuất dữ liệu ngữ cảnh cho mô hình ngôn ngữ lớn (LLM)."),
        ("What-If Analysis", "Phân tích mô phỏng kịch bản giả định để đánh giá tính khả thi trước khi chi tiêu lớn."),
        ("Time-Series", "Phương pháp phân tích và dự báo chuỗi dữ liệu theo dòng thời gian.")
    ]
    t = doc.add_table(rows=1, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    hdr[0].paragraphs[0].add_run("Thuật ngữ / Viết tắt").bold = True
    hdr[1].paragraphs[0].add_run("Định nghĩa & Ý nghĩa trong hệ thống").bold = True
    set_cell_background(hdr[0], "E2E8F0"); set_cell_background(hdr[1], "E2E8F0")
    t.columns[0].width = Inches(1.8)
    t.columns[1].width = Inches(4.5)

    for term, desc in terms:
        row = t.add_row().cells
        set_cell_margins(row[0]); set_cell_margins(row[1])
        r0 = row[0].paragraphs[0].add_run(term); r0.bold = True; r0.font.name = 'Times New Roman'; r0.font.size = Pt(11)
        r1 = row[1].paragraphs[0].add_run(desc); r1.font.name = 'Times New Roman'; r1.font.size = Pt(11)

    # ------------------ CHƯƠNG 1 ------------------
    add_styled_heading(doc, "CHƯƠNG 1: TỔNG QUAN, MỤC TIÊU & ĐẶC TẢ YÊU CẦU HỆ THỐNG (YÊU CẦU 1 & 2)", level=1)
    
    add_styled_heading(doc, "1.1 Bối Cảnh Thực Tế & Tính Cấp Thiết", level=2)
    add_body_p(doc, "Trong thời kỳ kinh tế nhiều biến động, việc quản lý tài chính cá nhân ngày càng đóng vai trò sống còn. Việc chi tiêu thiếu kiểm soát, không có quỹ dự phòng khẩn cấp và nợ nần mất kiểm soát là những nguyên nhân hàng đầu dẫn đến bất ổn tài chính.")
    add_body_p(doc, "Các ứng dụng hiện tại chỉ đóng vai trò ghi chép thụ động, không giải đáp được các câu hỏi then chốt: 'Liệu tôi có đủ tiền mua laptop này không?', 'Với đà chi tiêu này, tháng sau tôi có bị âm tiền không?', hay 'Tôi nên cắt giảm chi tiêu vào danh mục nào để đạt mục tiêu mua nhà?'. Do đó, việc xây dựng một Hệ thống Hỗ trợ Ra Quyết định (DSS) tích hợp AI là nhu cầu cấp bách.")

    add_styled_heading(doc, "1.2 Mục Tiêu Của Dự Án (Project Goals & Objectives)", level=2)
    add_body_p(doc, "Đề tài xác định rõ ràng mục tiêu tổng quát và các mục tiêu cụ thể cần đạt được:")
    
    add_body_p(doc, "1.2.1 Mục tiêu tổng quát (General Objective):", bold_prefix="a) ")
    add_body_p(doc, "Xây dựng hoàn chỉnh một ứng dụng Desktop mang tên Hệ thống Hỗ trợ Ra Quyết định Tài chính Cá nhân bằng Trí tuệ Nhân tạo (AI-FDSS), kết hợp giữa hệ quản trị cơ sở dữ liệu quan hệ MySQL, các giải thuật định lượng tài chính (Time-Series, Scoring Rules) và mô hình ngôn ngữ lớn (Google Gemini AI) nhằm giúp người dùng cá nhân chủ động kiểm soát dòng tiền, ngăn ngừa nguy cơ vỡ nợ và ra quyết định tài chính tối ưu.")

    add_body_p(doc, "1.2.2 Mục tiêu cụ thể (Specific Objectives):", bold_prefix="b) ")
    objectives = [
        "Mục tiêu 1 (Chuẩn hóa nghiệp vụ TPS): Xây dựng đầy đủ các chức năng quản lý tài chính nền tảng bao gồm quản lý đa ví tiền, danh mục thu/chi đa cấp, ghi chép giao dịch, lập lịch định kỳ, giám sát ngân sách và sổ nợ 2 chiều.",
        "Mục tiêu 2 (Hiện thực hóa các bài toán DSS cốt lõi): Thiết kế và cài đặt thành công 5 năng lực hỗ trợ ra quyết định thông minh: Đánh giá sức khỏe tài chính (thang điểm 10-100), Quét chi tiêu bất thường (>2.5x trung bình), Dự báo dòng tiền 3 tháng (Time-Series), Mô phỏng What-If mua sắm tài sản lớn, Trợ lý AI Copilot tương tác tự nhiên (RAG).",
        "Mục tiêu 3 (Trực quan hóa dữ liệu & Báo cáo): Thiết kế bảng điều khiển Dashboard chỉ huy hỗ trợ ra quyết định trong 3 giây; tích hợp hệ thống biểu đồ trực quan (Recharts) và chức năng xuất báo cáo định dạng CSV.",
        "Mục tiêu 4 (Tự động hóa & Khả năng triển khai độc lập): Tích hợp cơ chế Zero-Config tự động khởi tạo CSDL MySQL 17 bảng khi chạy ở máy mới; thiết lập quy trình kiểm thử tự động CI/CD trên GitHub Actions và đóng gói file cài đặt (.exe Installer) hoàn chỉnh."
    ]
    for obj in objectives:
        add_body_p(doc, obj, space_after=3)

    add_styled_heading(doc, "1.3 Phạm Vi Của Dự Án (Project Scope)", level=2)
    add_body_p(doc, "Để đảm bảo tính khả thi và chất lượng bàn giao theo đúng thời hạn 10 tuần, phạm vi dự án được phân định cụ thể như sau:")

    add_body_p(doc, "1.3.1 Phạm vi Chức năng (Functional Scope):", bold_prefix="a) ")
    scope_in = [
        "Phạm vi bao gồm (In-Scope):",
        "   • Quản lý thu/chi, phân bổ nguồn tiền giữa các ví (tiền mặt, thẻ ngân hàng, ví điện tử).",
        "   • Thiết lập và theo dõi hạn mức ngân sách chi tiêu hàng tháng kèm tỷ lệ cảnh báo.",
        "   • Quản lý danh bạ công nợ 2 chiều (nợ phải thu và nợ phải trả) kèm lịch sử thanh toán từng đợt.",
        "   • Tự động đánh giá sức khỏe tài chính và đề xuất các quyết định can thiệp 1-Click Apply.",
        "   • Phân tích What-If đối soát kế hoạch mua sắm lớn với dòng tiền dự phóng 3 tháng.",
        "   • Hội thoại trực tiếp với Trợ lý AI Copilot về tình hình tài chính thực tế.",
        "   • Báo cáo trực quan hóa biểu đồ và xuất dữ liệu báo cáo ra file CSV.",
        "Phạm vi không bao gồm / Giới hạn hệ thống (Out-of-Scope):",
        "   • Không tích hợp cổng thanh toán trực tiếp với các ngân hàng thương mại (do giới hạn pháp lý và chi phí API doanh nghiệp). Dữ liệu được ghi nhận thông qua nhập liệu người dùng.",
        "   • Không quản lý danh mục đầu tư chứng khoán, tiền mã hóa theo thời gian thực (real-time trading).",
        "   • Không thiết lập phân quyền quản trị đa người dùng phức tạp (RBAC) do hệ thống định vị là ứng dụng cá nhân hóa chạy độc lập (Single-User Desktop Privacy-First)."
    ]
    for sc in scope_in:
        add_body_p(doc, sc, space_after=3)

    add_body_p(doc, "1.3.2 Phạm vi Đối tượng Người dùng (Target Audience):", bold_prefix="b) ")
    add_body_p(doc, "Hệ thống hướng đến đối tượng người dùng cá nhân bao gồm: sinh viên đại học, người mới đi làm, nhân viên văn phòng và các chủ gia đình trẻ có thu nhập từ 1 hoặc nhiều nguồn, mong muốn kiểm soát chi tiêu chặt chẽ, xóa nợ và cần công cụ trợ lý thông minh hỗ trợ các quyết định chi dùng lớn.")

    add_body_p(doc, "1.3.3 Phạm vi Công nghệ & Nền tảng Triển khai (Platform & Technical Scope):", bold_prefix="c) ")
    add_body_p(doc, "• Hệ điều hành mục tiêu: Chạy mượt mà trên hệ điều hành Microsoft Windows 10 và Windows 11 (64-bit).")
    add_body_p(doc, "• Kiến trúc: Ứng dụng Desktop Native xây dựng trên nền Electron v34, giao diện React 19, TypeScript và Tailwind CSS.")
    add_body_p(doc, "• Cơ sở dữ liệu: Hệ quản trị CSDL quan hệ MySQL Server 8.0 chạy cục bộ qua cổng chuẩn 3306.")
    add_body_p(doc, "• Động cơ Trí tuệ Nhân tạo: Kết nối an toàn với Google Gemini 2.5 Flash API qua kênh IPC nội bộ của Electron.")

    add_body_p(doc, "1.3.4 Phạm vi Thời gian Triển khai (Time Scope):", bold_prefix="d) ")
    add_body_p(doc, "Dự án được thực hiện nghiêm ngặt trong 10 tuần, bắt đầu từ ngày 03/10/2026 và kết thúc, nghiệm thu báo cáo vào ngày 12/12/2026, tuân thủ mô hình phát triển phần mềm lặp Agile/Scrum gồm 5 Sprint (mỗi Sprint 2 tuần).")

    add_styled_heading(doc, "1.4 Sơ Đồ Phân Rã Chức Năng Nghiệp Vụ (BFD chuẩn 6 Module)", level=2)
    add_body_p(doc, "Hệ thống được thiết kế theo cấu trúc phân rã chuẩn gồm 6 Module nghiệp vụ chính. Sơ đồ hình cây BFD dưới đây minh họa toàn bộ các chức năng từ cấp hệ thống (0.0) xuống các chức năng con chi tiết:")
    
    # Embed BFD Diagram Image
    add_diagram(doc, "2_bfd_diagram.png", "Hình 1.1: Sơ đồ phân rã chức năng nghiệp vụ (BFD - Business Function Diagram)")

    add_styled_heading(doc, "1.5 Bảng Phân Biệt Giữa Chức Năng Quản Lý (TPS) và Chức Năng Hỗ Trợ Ra Quyết Định (DSS)", level=2)
    add_body_p(doc, "Bảng dưới đây chứng minh rõ nét sự khác biệt giữa các chức năng nhập liệu đơn thuần và các chức năng DSS thực thụ của đồ án:")

    t_dss = doc.add_table(rows=1, cols=4)
    t_dss.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_dss = t_dss.rows[0].cells
    cols_title = ["Phân loại", "Chức năng", "Dữ liệu đầu vào & Xử lý", "Giá trị Hỗ trợ Ra Quyết định (Output)"]
    for i, title in enumerate(cols_title):
        p = h_dss[i].paragraphs[0]
        r = p.add_run(title); r.bold = True; r.font.name = 'Times New Roman'; r.font.size = Pt(11)
        set_cell_background(h_dss[i], "DCE6F1")
        set_cell_margins(h_dss[i])

    dss_data = [
        ("Quản lý (TPS)", "Ghi chép giao dịch, quản lý ví", "Người dùng nhập số tiền, ngày giờ, danh mục. Lưu trữ vào CSDL MySQL.", "Hiển thị lịch sử giao dịch và số dư các ví."),
        ("Hỗ trợ Quyết định (DSS)", "Chấm điểm Sức khỏe Tài chính", "Phân tích số dư, tỷ lệ nợ/tài sản, thặng dư dòng tiền và nợ quá hạn.", "Tính điểm (10-100), xếp hạng rủi ro, chỉ ra chính xác các khoản thâm hụt."),
        ("Hỗ trợ Quyết định (DSS)", "Phát hiện Chi tiêu Bất thường", "Quét giao dịch 30 ngày so với mức trung bình 90 ngày của từng danh mục.", "Cảnh báo đỏ/hồng các khoản chi tăng đột biến kèm hành động kiểm soát."),
        ("Hỗ trợ Quyết định (DSS)", "Dự báo Dòng tiền 3 Tháng", "Thuật toán Time-Series kết hợp tỷ lệ tăng trưởng thu chi lịch sử.", "Dự phóng 3 kịch bản số dư (Tích cực, Kỳ vọng, Thận trọng) giúp lập ngân sách."),
        ("Hỗ trợ Quyết định (DSS)", "Mô phỏng Kịch bản What-If", "Thông số kế hoạch mua đồ lớn (trả trước, trả góp/tháng, kỳ hạn).", "Mô phỏng tác động dòng tiền tương lai, đánh giá Khả thi hay Nguy cơ vỡ nợ."),
        ("Hỗ trợ Quyết định (DSS)", "Khuyến nghị 1-Click", "Đối soát ngân sách sắp chạm ngưỡng cảnh báo (>= 80%).", "Đưa ra hành động cụ thể kèm nút bấm 'Áp dụng' tự động điều chỉnh hệ thống.")
    ]
    for cat, fn, inp, out in dss_data:
        row = t_dss.add_row().cells
        for idx, val in enumerate([cat, fn, inp, out]):
            set_cell_margins(row[idx])
            r = row[idx].paragraphs[0].add_run(val)
            r.font.name = 'Times New Roman'; r.font.size = Pt(10.5)
            if idx == 0:
                r.bold = True

    add_styled_heading(doc, "1.6 Sơ Đồ Use Case Tổng Thể Hệ Thống (UCD) & Kịch Bản Tương Tác", level=2)
    add_body_p(doc, "Sơ đồ Use Case tổng thể xác định ranh giới hệ thống, các tác nhân (Actors) và các trường hợp sử dụng trọng tâm:")
    add_body_p(doc, "• Tác nhân chính (Primary Actor): Người dùng cá nhân – người trực tiếp nhập liệu, xem báo cáo và thực hiện các quyết định tài chính.")
    add_body_p(doc, "• Tác nhân phụ (Secondary / External System): Google Gemini AI – động cơ trí tuệ nhân tạo bên ngoài đóng vai trò xử lý ngôn ngữ tự nhiên, lập luận logic và sinh kịch bản khuyến nghị.")
    
    # Embed UCD Diagram Image
    add_diagram(doc, "3_ucd_diagram.png", "Hình 1.2: Sơ đồ Use Case tổng thể hệ thống (Use Case Diagram - UCD)")

    # ------------------ CHƯƠNG 2 ------------------
    add_styled_heading(doc, "CHƯƠNG 2: THIẾT KẾ LƯU ĐỒ QUY TRÌNH HỖ TRỢ RA QUYẾT ĐỊNH (FLOWCHARTS - YÊU CẦU 3)", level=1)
    add_body_p(doc, "Chương này mô tả sơ đồ hoạt động tổng thể của toàn dự án và 5 lưu đồ quy trình nghiệp vụ DSS cốt lõi.")

    add_styled_heading(doc, "2.1 Sơ Đồ Hoạt Động Tổng Thể Của Toàn Dự Án (Overall Activity Workflow)", level=2)
    add_body_p(doc, "Sơ đồ hoạt động dưới đây mô tả trọn vẹn chu trình vận hành từ lúc người dùng khởi động ứng dụng, cơ chế tự động kiểm tra CSDL (Zero-Config), tải dữ liệu lên Dashboard, phân luồng xử lý song song các tác vụ TPS & DSS, cho đến khi vấn đáp cùng Trợ lý ảo AI Copilot:")
    
    # Embed Overall Activity Diagram Image
    add_diagram(doc, "5_overall_activity.png", "Hình 2.1: Sơ đồ hoạt động và luồng xử lý tổng thể của toàn dự án (Overall Activity Diagram)")

    add_styled_heading(doc, "2.2 Lưu Đồ Quy Trình Đánh Giá Sức Khỏe Tài Chính (Penalty Model)", level=2)
    add_body_p(doc, "Thuật toán đánh giá sức khỏe tài chính dựa trên mô hình trừ điểm vi phạm với điểm chuẩn tuyệt đối là 100 điểm:")
    steps_health = [
        "Bước 1: Trích xuất các chỉ số tài chính hiện hành từ CSDL: Tổng tài sản các ví, Thu nhập tháng, Chi tiêu tháng, Tổng dư nợ, Tình trạng nợ quá hạn.",
        "Bước 2: Kiểm tra trường hợp khởi đầu: Nếu chưa có giao dịch nào và Số dư ví = 0, hệ thống gán mặc định Điểm = 100/100 (Trạng thái: Hoàn hảo - Sạch nợ, chưa phát sinh rủi ro).",
        "Bước 3: Nếu đã có dữ liệu, khởi tạo Điểm = 100 và thực hiện kiểm tra 4 quy tắc phạt:",
        "   • Quy tắc 1 (Thâm hụt dòng tiền): Nếu Chi tiêu tháng > Thu nhập tháng -> Trừ 20 điểm.",
        "   • Quy tắc 2 (Quỹ dự phòng mỏng): Nếu Số dư ví < 1 tháng chi tiêu sinh hoạt -> Trừ 15 điểm.",
        "   • Quy tắc 3 (Áp lực nợ quá mức): Nếu Tổng nợ phải trả > 50% Tổng tài sản ví -> Trừ 25 điểm.",
        "   • Quy tắc 4 (Nợ xấu quá hạn): Nếu tồn tại bất kỳ khoản nợ nào bị quá hạn thanh toán -> Trừ 20 điểm.",
        "Bước 4: Tính toán điểm cuối cùng: Điểm = Giới hạn(Điểm, min=10, max=100).",
        "Bước 5: Phân hạng sức khỏe tài chính: >= 90 (Hoàn hảo), 75-89 (Tốt), 55-74 (Cần chú ý), < 55 (Báo động rủi ro cao). Lưu kết quả vào bảng `ai_user_profiles` và hiển thị trực quan lên Dashboard."
    ]
    for s in steps_health:
        add_body_p(doc, s, space_after=3)

    add_styled_heading(doc, "2.3 Lưu Đồ Quy Trình Phát Hiện Chi Tiêu Bất Thường (Anomaly Detection)", level=2)
    add_body_p(doc, "Hệ thống hỗ trợ quét và phát hiện các khoản chi đột biến theo lưu đồ sau:")
    steps_anomaly = [
        "Bước 1: Khi người dùng bấm 'Quét chi tiêu lạ' trên Dashboard hoặc kích hoạt tự động theo định kỳ.",
        "Bước 2: Hệ thống truy vấn toàn bộ các giao dịch chi tiêu trong 30 ngày gần nhất.",
        "Bước 3: Với mỗi giao dịch, tính toán mức chi tiêu trung bình lịch sử của danh mục tương ứng trong 90 ngày qua.",
        "Bước 4: So sánh: Nếu Số tiền chi tiêu hiện tại > 2.5 lần mức trung bình lịch sử của danh mục đó -> Đánh dấu là Giao dịch bất thường.",
        "Bước 5: Gọi AI Engine phân tích và đưa ra lời khuyên xử lý tương ứng.",
        "Bước 6: Ghi nhận vào bảng `ai_anomalies` và hiển thị thẻ cảnh báo màu hồng nổi bật trên giao diện Dashboard."
    ]
    for s in steps_anomaly:
        add_body_p(doc, s, space_after=3)

    add_styled_heading(doc, "2.4 Lưu Đồ Quy Trình Mô Phỏng Kịch Bản What-If & Duyệt Quyết Định 1-Click", level=2)
    steps_whatif = [
        "Bước 1: Người dùng truy cập trang 'Dự báo & Mô phỏng' (`/forecast-scenarios`) và nhập thông số bài toán What-If: Tên món đồ, Giá trị dự kiến, Số tiền trả trước, Chi phí phát sinh/trả góp hàng tháng, Thời gian trả góp.",
        "Bước 2: Hệ thống trích xuất dòng tiền thực tế hiện có (Số dư ví khả dụng, Thặng dư dòng tiền hàng tháng).",
        "Bước 3: Mô phỏng dòng tiền tháng t = 1..N: Đánh giá số dư sau khi thanh toán từng đợt.",
        "Bước 4: Kiểm tra điều kiện an toàn: Số dư dự phòng có bị rớt xuống dưới mức tối thiểu không?",
        "Bước 5: Nếu an toàn -> AI kết luận 'KHẢ THI' và gợi ý kế hoạch chi tiêu. Nếu rủi ro -> AI kết luận 'RỦI RO' và cảnh báo nguy cơ cạn kiệt thanh khoản.",
        "Bước 6: Lưu kịch bản vào bảng `ai_scenarios`."
    ]
    for s in steps_whatif:
        add_body_p(doc, s, space_after=3)

    # ------------------ CHƯƠNG 3 ------------------
    add_styled_heading(doc, "CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU & TRÍCH XUẤT SQL (YÊU CẦU 4 & 6)", level=1)
    add_body_p(doc, "Hệ thống triển khai Cơ sở dữ liệu quan hệ MySQL 8.0 với 17 bảng được chuẩn hóa 3NF, chia thành 2 phân hệ rõ rệt:")

    add_styled_heading(doc, "3.1 Sơ Đồ Quan Hệ Thực Thể (ERD 17 Bảng CSDL MySQL 8.0)", level=2)
    add_body_p(doc, "Sơ đồ thực thể liên kết ERD dưới đây mô tả chi tiết quan hệ giữa 9 bảng thuộc phân hệ Nghiệp vụ Tài chính Core (xanh dương) và 8 bảng thuộc phân hệ Hỗ trợ ra quyết định & AI Engine (tím):")

    # Embed ERD Diagram Image
    add_diagram(doc, "4_erd_diagram.png", "Hình 3.1: Sơ đồ quan hệ thực thể (ERD 17 bảng trong MySQL 8.0 chuẩn 3NF)")

    add_styled_heading(doc, "3.2 Bảng Danh Mục 17 Bảng Dữ Liệu Trong Hệ Thống", level=2)
    
    t_tbl = doc.add_table(rows=1, cols=4)
    t_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_tbl = t_tbl.rows[0].cells
    for i, title in enumerate(["STT", "Tên bảng trong MySQL", "Phân hệ", "Mục đích & Ý nghĩa nghiệp vụ"]):
        h_tbl[i].paragraphs[0].add_run(title).bold = True
        set_cell_background(h_tbl[i], "DCE6F1")
        set_cell_margins(h_tbl[i])
    t_tbl.columns[0].width = Inches(0.6)
    t_tbl.columns[1].width = Inches(2.2)
    t_tbl.columns[2].width = Inches(1.5)
    t_tbl.columns[3].width = Inches(2.7)

    table_records = [
        ("1", "categories", "Nghiệp vụ Core", "Lưu trữ danh mục thu chi đa cấp kèm màu sắc và icon."),
        ("2", "wallets", "Nghiệp vụ Core", "Quản lý ví tiền mặt, tài khoản ngân hàng, ví điện tử."),
        ("3", "budgets", "Nghiệp vụ Core", "Quản lý hạn mức chi tiêu theo tháng và chu kỳ."),
        ("4", "budget_categories", "Nghiệp vụ Core", "Bảng liên kết N-N giữa ngân sách và các danh mục áp dụng."),
        ("5", "debts", "Nghiệp vụ Core", "Sổ theo dõi công nợ 2 chiều (nợ phải thu / nợ phải trả)."),
        ("6", "debt_payments", "Nghiệp vụ Core", "Lịch sử các đợt trả nợ, tự động điều chỉnh số dư ví liên quan."),
        ("7", "saving_goals", "Nghiệp vụ Core", "Theo dõi mục tiêu tiết kiệm và số tiền đã tích lũy."),
        ("8", "transactions", "Nghiệp vụ Core", "Lưu toàn bộ giao dịch thu, chi, chuyển khoản giữa các ví."),
        ("9", "recurring_transactions", "Nghiệp vụ Core", "Lập lịch tự động ghi nhận các giao dịch định kỳ hàng tháng."),
        ("10", "ai_user_profiles", "Hỗ trợ Quyết định (DSS)", "Lưu hồ sơ tài chính, khẩu vị rủi ro và điểm sức khỏe tài chính."),
        ("11", "ai_recommendations", "Hỗ trợ Quyết định (DSS)", "Lưu các khuyến nghị tối ưu dòng tiền kèm nút bấm 1-Click Apply."),
        ("12", "ai_cashflow_forecasts", "Hỗ trợ Quyết định (DSS)", "Lưu trữ kết quả dự báo dòng tiền 3 tháng tới (Time-Series)."),
        ("13", "ai_scenarios", "Hỗ trợ Quyết định (DSS)", "Lưu các kịch bản mô phỏng What-If mua sắm tài sản lớn."),
        ("14", "ai_anomalies", "Hỗ trợ Quyết định (DSS)", "Lưu danh sách giao dịch chi tiêu bất thường bị AI phát hiện."),
        ("15", "ai_chat_sessions", "Hỗ trợ Quyết định (DSS)", "Quản lý phiên hội thoại với Trợ lý ảo AI Copilot."),
        ("16", "ai_chat_messages", "Hỗ trợ Quyết định (DSS)", "Lưu chi tiết các tin nhắn trao đổi giữa người dùng và AI."),
        ("17", "ai_configs", "Quản trị Hệ thống", "Cấu hình tùy chọn mô hình Gemini theo mục đích sử dụng.")
    ]
    for stt, tname, grp, purp in table_records:
        row = t_tbl.add_row().cells
        for idx, val in enumerate([stt, tname, grp, purp]):
            set_cell_margins(row[idx])
            r = row[idx].paragraphs[0].add_run(val)
            r.font.name = 'Times New Roman'; r.font.size = Pt(10)
            if idx == 1:
                r.bold = True

    add_styled_heading(doc, "3.3 Các Câu Lệnh SQL Đặc Trưng Phục Vụ Hỗ Trợ Ra Quyết Định (Yêu cầu 6)", level=2)
    add_body_p(doc, "Hệ thống sử dụng các câu truy vấn SQL nâng cao với các hàm tổng hợp và điều kiện phức tạp để phục vụ suy luận ra quyết định:")

    sql1 = (
        "-- Truy vấn 1: Tính toán Dòng tiền ròng & Tỷ lệ tiết kiệm tháng hiện tại\n"
        "SELECT \n"
        "    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,\n"
        "    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,\n"
        "    (COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - \n"
        "     COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)) AS net_cashflow,\n"
        "    ROUND((COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - \n"
        "           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)) / \n"
        "           NULLIF(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) * 100, 2) AS savings_rate_percent\n"
        "FROM transactions\n"
        "WHERE transaction_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01');"
    )
    add_code_box(doc, sql1)

    sql2 = (
        "-- Truy vấn 2: Phát hiện các giao dịch chi tiêu vượt 2.5 lần trung bình danh mục (Anomaly Detection)\n"
        "SELECT t.id, t.amount, t.transaction_date, t.note, c.name AS category_name, avg_table.avg_amount\n"
        "FROM transactions t\n"
        "JOIN categories c ON t.category_id = c.id\n"
        "JOIN (\n"
        "    SELECT category_id, AVG(amount) AS avg_amount\n"
        "    FROM transactions\n"
        "    WHERE type = 'expense' AND transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)\n"
        "    GROUP BY category_id\n"
        ") avg_table ON t.category_id = avg_table.category_id\n"
        "WHERE t.type = 'expense' \n"
        "  AND t.amount > (avg_table.avg_amount * 2.5)\n"
        "  AND t.transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY);"
    )
    add_code_box(doc, sql2)

    sql3 = (
        "-- Truy vấn 3: Rà soát các ngân sách chi tiêu đã vượt ngưỡng báo động (>= 80%)\n"
        "SELECT \n"
        "    b.id, b.name, b.amount AS budget_limit,\n"
        "    COALESCE(SUM(t.amount), 0) AS used_amount,\n"
        "    ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 2) AS usage_percent\n"
        "FROM budgets b\n"
        "JOIN budget_categories bc ON b.id = bc.budget_id\n"
        "LEFT JOIN transactions t ON bc.category_id = t.category_id \n"
        "    AND t.type = 'expense' \n"
        "    AND t.transaction_date BETWEEN b.start_date AND b.end_date\n"
        "GROUP BY b.id, b.name, b.amount\n"
        "HAVING usage_percent >= 80.00;"
    )
    add_code_box(doc, sql3)

    add_styled_heading(doc, "3.4 Tính Năng Tự Động Khởi Tạo CSDL Khi Sang Máy Mới (Zero-Config)", level=2)
    add_body_p(doc, "Để phục vụ chấm thi và triển khai thuận tiện trên bất kỳ máy tính nào của giảng viên mà không cần thao tác import SQL thủ công qua Navicat/phpMyAdmin:")
    add_body_p(doc, "Hệ thống đã tích hợp sẵn module `ensureDatabaseInitialized()` trong `backend/electron/database/connection.ts` và bộ DDL `init_schema.ts`. Khi khởi động ứng dụng lần đầu, hệ thống tự động kết nối MySQL Server trên cổng 3306, tự tạo Database `personal_finance` và tự sinh toàn bộ 17 bảng kèm dữ liệu danh mục mẫu hoàn toàn tự động.")

    # ------------------ CHƯƠNG 4 ------------------
    add_styled_heading(doc, "CHƯƠNG 4: THIẾT KẾ GIAO DIỆN & BÁO CÁO (GUI & REPORTS - YÊU CẦU 5 & 6)", level=1)
    
    add_styled_heading(doc, "4.1 Bố Cục Trung Tâm Chỉ Huy Dashboard", level=2)
    add_body_p(doc, "Dashboard được thiết kế theo chuẩn UI hiện đại với các thành phần cốt lõi:")
    add_body_p(doc, "• Dải thẻ KPI tài chính trên cùng: Tổng tài sản, Thu nhập trong tháng, Chi tiêu trong tháng và Dòng tiền ròng.")
    add_body_p(doc, "• Khối Ra quyết định AI (AI Decision Center): Hiển thị huy hiệu Điểm sức khỏe tài chính (khởi đầu 100/100 Hoàn hảo), khu vực cảnh báo chi tiêu lạ màu hồng và danh sách khuyến nghị can thiệp kèm nút 'Áp dụng quyết định' (1-Click Apply).")
    add_body_p(doc, "• Biểu đồ phân tích tài chính: Biểu đồ cột thể hiện biến động thu/chi 12 tháng và biểu đồ tròn phân bổ cơ cấu chi tiêu.")

    add_styled_heading(doc, "4.2 Module Chuyên Biệt Dự Báo & Mô Phỏng What-If (`/forecast-scenarios`)", level=2)
    add_body_p(doc, "Màn hình dành riêng cho người dùng thực hiện các quyết định tài chính chiến lược:")
    add_body_p(doc, "• Phần 1 - Dự báo Dòng tiền 3 tháng tới: Sử dụng biểu đồ vùng AreaChart thể hiện 3 kịch bản: Dự báo kỳ vọng, Kịch bản tích cực và Kịch bản thận trọng.")
    add_body_p(doc, "• Phần 2 - Công cụ Mô phỏng What-If: Người dùng nhập kế hoạch mua sắm tài sản lớn, hệ thống đối soát tự động với dòng tiền dự phóng và đưa ra kết luận tính khả thi cùng cảnh báo rủi ro thanh khoản.")

    add_styled_heading(doc, "4.3 Trợ Lý Cố Vấn Tài Chính Nổi Toàn Cục (Floating AI Copilot Chatbot)", level=2)
    add_body_p(doc, "Trợ lý ảo thông minh xuất hiện dưới dạng nút tròn nổi cố định ở góc phải màn hình (`FloatingAiChat.tsx`). Ứng dụng kỹ thuật RAG Finance để đọc trực tiếp dữ liệu số dư, thu chi tháng hiện tại và giải đáp mọi thắc mắc của người dùng bằng tiếng Việt tự nhiên.")

    add_styled_heading(doc, "4.4 Thiết Kế Các Mẫu Báo Cáo Tài Chính & Xuất Dữ Liệu CSV (Yêu cầu 5)", level=2)
    add_body_p(doc, "Hệ thống cung cấp 4 mẫu báo cáo chuyên đề và chức năng xuất file CSV phục vụ kiểm toán cá nhân:")
    add_body_p(doc, "1. Mẫu Báo cáo Dòng tiền thu chi theo chu kỳ (Tháng / Quý / Năm).")
    add_body_p(doc, "2. Mẫu Báo cáo Mức độ tuân thủ hạn mức ngân sách chi tiêu.")
    add_body_p(doc, "3. Mẫu Báo cáo Tình trạng công nợ và lịch trình thanh toán.")
    add_body_p(doc, "4. Mẫu Báo cáo Tổng kết Khuyến nghị AI và Lịch sử can thiệp dòng tiền.")

    # ------------------ CHƯƠNG 5 ------------------
    add_styled_heading(doc, "CHƯƠNG 5: HIỆN THỰC HÓA MÃ NGUỒN, TÍCH HỢP AI & ĐÓNG GÓI (+ AI BONUS)", level=1)
    
    add_styled_heading(doc, "5.1 Sơ Đồ Kiến Trúc Tổng Thể Hệ Thống (System Architecture)", level=2)
    add_body_p(doc, "Hệ thống được thiết kế theo kiến trúc 3 tầng (3-Tier Desktop Hybrid Architecture) đảm bảo tính mở rộng, hiệu năng cao và phân tách rõ ràng trách nhiệm:")
    add_body_p(doc, "• Tầng Giao diện Người dùng (Presentation Layer): Xây dựng bằng React 19, Vite và Tailwind CSS, tích hợp biểu đồ Recharts và các components tương tác.")
    add_body_p(doc, "• Tầng Điều hành & Nghiệp vụ (Application & Logic Layer): Chạy trên Node.js và Electron Main Process, xử lý IPC routing bảo mật, thuật toán chấm điểm DSS và bộ lọc Anomaly Scanner.")
    add_body_p(doc, "• Tầng Dữ liệu & Động cơ AI (Data & AI Layer): CSDL MySQL Server 8.0 cục bộ lưu trữ an toàn kết hợp Google Gemini AI Cloud API qua kỹ thuật RAG.")

    # Embed Architecture Diagram Image
    add_diagram(doc, "1_system_architecture.png", "Hình 5.1: Sơ đồ kiến trúc 3 tầng tổng thể của hệ thống AI-FDSS")

    add_styled_heading(doc, "5.2 Đóng Gói Cài Đặt Windows & Tự Động Hóa CI/CD", level=2)
    add_body_p(doc, "• CI/CD Pipeline: Dự án thiết lập quy trình tích hợp liên tục tự động trên GitHub Actions (`.github/workflows/ci.yml`) để tự động kiểm tra cú pháp, biên dịch TypeScript và chạy Unit Test trước khi hợp nhất mã nguồn.")
    add_body_p(doc, "• Đóng gói Installer: Ứng dụng được biên dịch và đóng gói hoàn chỉnh thành file cài đặt độc lập cho Windows: `release/Personal Finance Setup 3.0.0.exe` thông qua `electron-builder`.")

    # ------------------ CHƯƠNG 6 ------------------
    add_styled_heading(doc, "CHƯƠNG 6: QUẢN LÝ DỰ ÁN THEO PHƯƠNG PHÁP LUẬN AGILE/SCRUM", level=1)
    add_body_p(doc, "Dự án được triển khai trong thời gian 10 tuần (từ 03/10/2026 đến 12/12/2026), chia làm 5 Sprint theo mô hình Agile/Scrum chuẩn quốc tế:")

    t_sprint = doc.add_table(rows=1, cols=4)
    t_sprint.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_sp = t_sprint.rows[0].cells
    for i, title in enumerate(["Sprint", "Thời gian", "Mục tiêu trọng tâm", "Sản phẩm bàn giao (Deliverables)"]):
        h_sp[i].paragraphs[0].add_run(title).bold = True
        set_cell_background(h_sp[i], "DCE6F1")
        set_cell_margins(h_sp[i])
    t_sprint.columns[0].width = Inches(1.0)
    t_sprint.columns[1].width = Inches(1.5)
    t_sprint.columns[2].width = Inches(2.2)
    t_sprint.columns[3].width = Inches(2.3)

    sprints = [
        ("Sprint 1", "03/10 - 16/10/2026", "Khảo sát, BFD, Use Case & Thiết kế CSDL 17 bảng", "Tài liệu đặc tả yêu cầu, Sơ đồ ERD, Script DDL MySQL."),
        ("Sprint 2", "17/10 - 30/10/2026", "Xây dựng khung Electron + React & Các module TPS", "Quản lý ví, ghi chép giao dịch, danh mục thu chi."),
        ("Sprint 3", "31/10 - 13/11/2026", "Hiện thực hóa Ngân sách, Công nợ & Flowcharts DSS", "Module sổ nợ 2 chiều, thuật toán chấm điểm sức khỏe tài chính."),
        ("Sprint 4", "14/11 - 27/11/2026", "Tích hợp Gemini AI, RAG Finance & Mô phỏng What-If", "Trợ lý AI Copilot nổi, phân tích kịch bản What-If, dự báo dòng tiền."),
        ("Sprint 5", "28/11 - 12/12/2026", "Kiểm thử, Đóng gói Installer & Hoàn thiện Hồ sơ", "File cài đặt .exe, Báo cáo đồ án hoàn chỉnh, Slide thuyết trình.")
    ]
    for sp, dt, ob, de in sprints:
        row = t_sprint.add_row().cells
        for idx, val in enumerate([sp, dt, ob, de]):
            set_cell_margins(row[idx])
            r = row[idx].paragraphs[0].add_run(val)
            r.font.name = 'Times New Roman'; r.font.size = Pt(10)
            if idx == 0:
                r.bold = True

    add_styled_heading(doc, "6.2 Ma Trận Phân Công Trách Nhiệm Nhóm 5 Thành Viên (RACI)", level=2)
    add_body_p(doc, "Nhóm 5 thành viên được phân công nhiệm vụ rõ ràng theo đúng chuyên môn:")
    add_body_p(doc, "• Thành viên 1 (Phạm Văn Long - Trưởng nhóm): Thiết kế kiến trúc hệ thống, Electron Main/IPC, CI/CD GitHub Actions, tích hợp hệ thống và kiểm soát tiến độ.")
    add_body_p(doc, "• Thành viên 2 (Kỹ sư Backend & Database): Cài đặt CSDL MySQL 8.0, hiện thực hóa các truy vấn SQL phức tạp, module tự động khởi tạo CSDL (`init_schema.ts`).")
    add_body_p(doc, "• Thành viên 3 (Kỹ sư Trí tuệ Nhân tạo & DSS): Xây dựng thuật toán chấm điểm sức khỏe tài chính, tích hợp Gemini API, xây dựng hệ thống gợi ý 1-Click và kỹ thuật RAG.")
    add_body_p(doc, "• Thành viên 4 (Kỹ sư Frontend Core): Xây dựng giao diện nghiệp vụ ví, danh mục, ngân sách, công nợ và các form nhập liệu.")
    add_body_p(doc, "• Thành viên 5 (Kỹ sư Frontend Charts & QA): Xây dựng biểu đồ Recharts, giao diện Dự báo dòng tiền, kiểm thử phần mềm và chuẩn bị hồ sơ báo cáo.")

    # ------------------ KẾT LUẬN ------------------
    add_styled_heading(doc, "KẾT LUẬN & HƯỚNG PHÁT TRIỂN (EXPAND TO MOBILE)", level=1)
    add_body_p(doc, "Đồ án 'Hệ thống hỗ trợ ra quyết định tài chính cá nhân bằng AI (AI-FDSS)' đã đáp ứng trọn vẹn 100% các yêu cầu bắt buộc của môn học IS402, đồng thời đạt điểm khuyến khích tối đa ở phần tích hợp Trí tuệ Nhân tạo:")
    add_body_p(doc, "1. Hoàn thành sơ đồ BFD và Use Case đặc tả toàn diện bài toán tài chính cá nhân.")
    add_body_p(doc, "2. Thiết kế và hiện thực hóa thành công các lưu đồ thuật toán DSS (chấm điểm sức khỏe, quét bất thường, dự báo chuỗi thời gian, mô phỏng What-If).")
    add_body_p(doc, "3. Cài đặt CSDL MySQL 8.0 gồm 17 bảng chuẩn hóa với cơ chế Zero-Config tự động khởi tạo khi sang máy mới.")
    add_body_p(doc, "4. Giao diện Desktop hiện đại, trực quan, tích hợp trợ lý AI Copilot thông minh.")
    add_body_p(doc, "• Định hướng tương lai: Nhóm dự kiến sử dụng Capacitor hoặc React Native để tái sử dụng mã nguồn và lấn sân sang nền tảng Mobile (iOS / Android), kết hợp công nghệ OCR đọc hóa đơn tự động qua Vision AI.")

    # Save document
    try:
        doc.save(output_path)
        print(f"File updated successfully at: {output_path}")
    except PermissionError:
        fallback_path = output_path.replace(".docx", "_Moi_Nhat.docx")
        doc.save(fallback_path)
        print(f"WARNING: File {output_path} is currently OPEN in Microsoft Word.")
        print(f"Saved updated file to: {fallback_path}")

if __name__ == "__main__":
    out_dir = r"d:\personal-finance\docs"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "Bao_Cao_Do_An_IS402_AI_FDSS.docx")
    build_docx(out_file)
