import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

out_dir = r"d:\personal-finance\docs\diagrams"
os.makedirs(out_dir, exist_ok=True)

# Set common font & styling
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'

# ==============================================================================
# 1. ARCHITECTURE DIAGRAM (Sơ đồ Kiến trúc Tổng thể Hệ thống)
# ==============================================================================
def draw_architecture():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    # Title
    ax.text(5.5, 7.6, "SƠ ĐỒ KIẾN TRÚC TỔNG THỂ HỆ THỐNG (AI-FDSS ARCHITECTURE)", 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')

    # Layer 1: Presentation Layer
    rect_ui = patches.FancyBboxPatch((0.5, 5.2), 10, 1.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     linewidth=1.5, edgecolor='#2563EB', facecolor='#EFF6FF')
    ax.add_patch(rect_ui)
    ax.text(0.8, 6.8, "TẦNG GIAO DIỆN NGƯỜI DÙNG (PRESENTATION LAYER - REACT 19 + VITE + TAILWIND)", 
            fontsize=9.5, fontweight='bold', color='#1E40AF')

    ui_boxes = [
        ("Dashboard Chỉ Huy\n(KPIs, Khuyến nghị 1-Click)", 0.8, 5.4, 2.1, 1.1),
        ("Dự Báo & What-If\n(Time-Series / Scenarios)", 3.1, 5.4, 2.1, 1.1),
        ("Quản Lý Core\n(Ví, Thu Chi, Ngân sách)", 5.4, 5.4, 2.1, 1.1),
        ("Trợ Lý AI Copilot\n(Floating Chat Widget)", 7.7, 5.4, 2.6, 1.1)
    ]
    for text, x, y, w, h in ui_boxes:
        b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.1",
                                   linewidth=1.2, edgecolor='#93C5FD', facecolor='#FFFFFF')
        ax.add_patch(b)
        ax.text(x + w/2, y + h/2, text, fontsize=8.5, ha='center', va='center', color='#1E293B', fontweight='bold')

    # Bidirectional IPC Arrow
    ax.annotate("", xy=(5.5, 4.8), xytext=(5.5, 5.2),
                arrowprops=dict(arrowstyle="<->", color="#2563EB", lw=2, mutation_scale=15))
    ax.text(5.6, 5.0, "IPC Bridge (preload / contextBridge - Safe Channel)", fontsize=8, color="#2563EB", fontweight='bold')

    # Layer 2: Application / Electron Process Layer
    rect_app = patches.FancyBboxPatch((0.5, 2.8), 10, 1.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                      linewidth=1.5, edgecolor='#059669', facecolor='#ECFDF5')
    ax.add_patch(rect_app)
    ax.text(0.8, 4.4, "TẦNG ĐIỀU HÀNH & NGHIỆP VỤ (APPLICATION & LOGIC LAYER - ELECTRON MAIN / NODE.JS)", 
            fontsize=9.5, fontweight='bold', color='#065F46')

    app_boxes = [
        ("IPC Dispatcher &\nRouting Controllers", 0.8, 3.0, 2.1, 1.1),
        ("DSS Scoring Engine\n(Penalty Model Base 100)", 3.1, 3.0, 2.2, 1.1),
        ("RAG Context Builder &\nAnomaly Scanner", 5.5, 3.0, 2.3, 1.1),
        ("Auto-Init DB Manager\n(& Migration Engine)", 8.0, 3.0, 2.3, 1.1)
    ]
    for text, x, y, w, h in app_boxes:
        b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.1",
                                   linewidth=1.2, edgecolor='#A7F3D0', facecolor='#FFFFFF')
        ax.add_patch(b)
        ax.text(x + w/2, y + h/2, text, fontsize=8.5, ha='center', va='center', color='#1E293B', fontweight='bold')

    # Connecting Arrows to Layer 3
    ax.annotate("", xy=(3.0, 2.2), xytext=(3.0, 2.8),
                arrowprops=dict(arrowstyle="<->", color="#D97706", lw=2, mutation_scale=15))
    ax.annotate("", xy=(8.0, 2.2), xytext=(8.0, 2.8),
                arrowprops=dict(arrowstyle="<->", color="#7C3AED", lw=2, mutation_scale=15))

    # Layer 3: Data & External AI Intelligence Layer
    rect_data = patches.FancyBboxPatch((0.5, 0.4), 4.8, 1.7, boxstyle="round,pad=0.1,rounding_size=0.15",
                                       linewidth=1.5, edgecolor='#D97706', facecolor='#FFFBEB')
    ax.add_patch(rect_data)
    ax.text(0.8, 1.8, "TẦNG CƠ SỞ DỮ LIỆU (DATABASE LAYER)", fontsize=9, fontweight='bold', color='#92400E')
    ax.text(2.9, 1.0, "MySQL Server 8.0 (Localhost:3306)\n• 17 Bảng Chuẩn Hóa 3NF\n• Connection Pool (mysql2/promise)\n• Tự Động Khởi Tạo DDL Zero-Config", 
            fontsize=8.5, ha='center', va='center', color='#451A03')

    rect_ai = patches.FancyBboxPatch((5.7, 0.4), 4.8, 1.7, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     linewidth=1.5, edgecolor='#7C3AED', facecolor='#F5F3FF')
    ax.add_patch(rect_ai)
    ax.text(6.0, 1.8, "TẦNG TRÍ TUỆ NHÂN TẠO (AI ENGINE LAYER)", fontsize=9, fontweight='bold', color='#5B21B6')
    ax.text(8.1, 1.0, "Google Gemini AI API (Cloud REST)\n• Models: Gemini 2.5 Flash / Flash Latest\n• API Key Encapsulated (Bảo mật IPC)\n• RAG Context Injection & What-If Inference", 
            fontsize=8.5, ha='center', va='center', color='#2E1065')

    plt.tight_layout()
    file_path = os.path.join(out_dir, "1_system_architecture.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 1_system_architecture.png")

# ==============================================================================
# 2. BFD DIAGRAM (Cây Phân Rã Chức Năng Nghiệp Vụ)
# ==============================================================================
def draw_bfd():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(5.5, 7.6, "SƠ ĐỒ PHÂN RÃ CHỨC NĂNG NGHIỆP VỤ (BFD - 6 MODULES)", 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')

    # Root Box
    root = patches.FancyBboxPatch((2.5, 6.5), 6.0, 0.75, boxstyle="round,pad=0.1,rounding_size=0.12",
                                  linewidth=1.5, edgecolor='#1E3A8A', facecolor='#1E40AF')
    ax.add_patch(root)
    ax.text(5.5, 6.87, "0.0 HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN (AI-FDSS)", 
            fontsize=9.5, fontweight='bold', ha='center', va='center', color='#FFFFFF')

    # 6 Modules
    modules = [
        ("1.0 Quản Lý Thu Chi &\nDòng Tiền (TPS)", 0.6, 4.8, 1.45, "#EFF6FF", "#3B82F6", 
         ["1.1 Quản lý ví", "1.2 Danh mục", "1.3 Ghi giao dịch", "1.4 Lịch định kỳ"]),
        ("2.0 Quản Lý Ngân Sách\n& Tiết Kiệm", 2.3, 4.8, 1.45, "#ECFDF5", "#10B981", 
         ["2.1 Định mức tháng", "2.2 Cảnh báo vượt", "2.3 Mục tiêu tiết kiệm"]),
        ("3.0 Quản Lý Công Nợ\nCá Nhân (2 Chiều)", 4.0, 4.8, 1.45, "#FEF3C7", "#F59E0B", 
         ["3.1 Sổ nợ 2 chiều", "3.2 Trả từng đợt", "3.3 Cảnh báo nợ xấu"]),
        ("4.0 Báo Cáo &\nPhân Tích Dữ Liệu", 5.7, 4.8, 1.45, "#F3E8FF", "#8B5CF6", 
         ["4.1 KPI Dashboard", "4.2 Cơ cấu chi tiêu", "4.3 Xuất file CSV"]),
        ("5.0 Hỗ Trợ Ra Quyết\nĐịnh AI (TRỌNG TÂM)", 7.4, 4.8, 1.55, "#FEE2E2", "#EF4444", 
         ["5.1 Điểm sức khỏe", "5.2 Quét bất thường", "5.3 Dự báo 3 tháng", "5.4 Mô phỏng What-If", "5.5 Khuyến nghị 1-Click", "5.6 AI Copilot (RAG)"]),
        ("6.0 Cài Đặt &\nQuản Trị Hệ Thống", 9.15, 4.8, 1.4, "#F1F5F9", "#64748B", 
         ["6.1 Tùy chọn Model", "6.2 Test kết nối DB", "6.3 Sao lưu dữ liệu"])
    ]

    for title, x, y, w, bg, border, subs in modules:
        # Connecting Line from Root to Module
        ax.plot([5.5, x + w/2], [6.5, y + 0.9], color='#94A3B8', lw=1.2, zorder=1)
        
        # Module Box
        m_box = patches.FancyBboxPatch((x, y), w, 0.9, boxstyle="round,pad=0.08,rounding_size=0.1",
                                       linewidth=1.3, edgecolor=border, facecolor=bg)
        ax.add_patch(m_box)
        ax.text(x + w/2, y + 0.45, title, fontsize=8, fontweight='bold', ha='center', va='center', color='#0F172A')

        # Sub-functions below
        sy = y - 0.4
        for sub in subs:
            s_box = patches.FancyBboxPatch((x, sy), w, 0.32, boxstyle="round,pad=0.04,rounding_size=0.06",
                                           linewidth=0.8, edgecolor='#CBD5E1', facecolor='#FFFFFF')
            ax.add_patch(s_box)
            ax.text(x + w/2, sy + 0.16, sub, fontsize=7.2, ha='center', va='center', color='#334155')
            # Line connector
            ax.plot([x + w/2, x + w/2], [sy + 0.32, sy + 0.4], color='#CBD5E1', lw=0.8)
            sy -= 0.38

    plt.tight_layout()
    file_path = os.path.join(out_dir, "2_bfd_diagram.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 2_bfd_diagram.png")

# ==============================================================================
# 3. UCD DIAGRAM (Sơ Đồ Use Case Tổng Thể)
# ==============================================================================
def draw_ucd():
    fig, ax = plt.subplots(figsize=(11, 7.8), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    ax.text(5.5, 7.6, "SƠ ĐỒ USE CASE TỔNG THỂ HỆ THỐNG (AI-FDSS USE CASE DIAGRAM)", 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')

    # System Boundary Box
    sys_bound = patches.FancyBboxPatch((2.2, 0.4), 6.6, 6.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                      linewidth=1.8, edgecolor='#3B82F6', facecolor='#F8FAFC', linestyle='--')
    ax.add_patch(sys_bound)
    ax.text(2.5, 7.0, "SYSTEM BOUNDARY: ỨNG DỤNG AI-FDSS DESKTOP", fontsize=9, fontweight='bold', color='#1D4ED8')

    # Actor 1: Primary User (Left)
    ax.plot([1.0], [4.5], marker='o', markersize=16, color='#1E40AF')
    ax.plot([1.0, 1.0], [4.2, 3.4], color='#1E40AF', lw=3)
    ax.plot([0.5, 1.5], [3.9, 3.9], color='#1E40AF', lw=3)
    ax.plot([1.0, 0.6], [3.4, 2.7], color='#1E40AF', lw=3)
    ax.plot([1.0, 1.4], [3.4, 2.7], color='#1E40AF', lw=3)
    ax.text(1.0, 2.3, "Người Dùng\nCá Nhân", fontsize=9.5, fontweight='bold', ha='center', color='#0F172A')

    # Actor 2: Secondary / External System: Google Gemini AI (Right)
    ax.plot([10.0], [4.5], marker='s', markersize=16, color='#7C3AED')
    ax.text(10.0, 4.5, "AI", fontsize=8, fontweight='bold', ha='center', va='center', color='#FFFFFF')
    ax.plot([10.0, 10.0], [4.2, 3.4], color='#7C3AED', lw=3)
    ax.plot([9.5, 10.5], [3.9, 3.9], color='#7C3AED', lw=3)
    ax.plot([10.0, 9.6], [3.4, 2.7], color='#7C3AED', lw=3)
    ax.plot([10.0, 10.4], [3.4, 2.7], color='#7C3AED', lw=3)
    ax.text(10.0, 2.3, "Google Gemini AI\n(External Engine)", fontsize=9, fontweight='bold', ha='center', color='#4C1D95')

    # Use Cases (Ellipses / Round Boxes)
    use_cases = [
        ("UC01: Ghi nhận thu/chi & Lập lịch định kỳ", 2.6, 6.3, 3.2, 0.55, False),
        ("UC02: Thiết lập & Giám sát ngân sách tháng", 2.6, 5.5, 3.2, 0.55, False),
        ("UC03: Quản lý sổ công nợ 2 chiều & Trả góp", 2.6, 4.7, 3.2, 0.55, False),
        ("UC04: Xem Dashboard tổng quan & Xuất báo cáo CSV", 2.6, 3.9, 3.2, 0.55, False),
        ("UC05: Đánh giá Điểm sức khỏe tài chính & Khẩu vị", 4.0, 3.1, 3.6, 0.55, True),
        ("UC06: Quét & Cảnh báo chi tiêu bất thường", 4.2, 2.3, 3.4, 0.55, True),
        ("UC07: Dự báo dòng tiền 3 tháng (Time-Series)", 4.2, 1.5, 3.4, 0.55, True),
        ("UC08: Mô phỏng What-If mua sắm & Phê duyệt 1-Click", 4.0, 0.7, 3.6, 0.55, True),
        ("UC09: Vấn đáp tư vấn tài chính với AI Copilot (RAG)", 5.2, 4.7, 3.3, 0.55, True)
    ]

    for title, x, y, w, h, is_ai in use_cases:
        bg = "#FEE2E2" if is_ai else "#EFF6FF"
        border = "#DC2626" if is_ai else "#2563EB"
        b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.25",
                                   linewidth=1.2, edgecolor=border, facecolor=bg)
        ax.add_patch(b)
        ax.text(x + w/2, y + h/2, title, fontsize=8, ha='center', va='center', 
                color='#991B1B' if is_ai else '#1E3A8A', fontweight='bold')

        # Link from User to Use Case
        ax.plot([1.4, x], [3.9, y + h/2], color='#64748B', lw=1.0, linestyle='-')

        # Link to AI if AI DSS case
        if is_ai:
            ax.plot([x + w, 9.6], [y + h/2, 3.9], color='#9333EA', lw=1.2, linestyle=':')

    plt.tight_layout()
    file_path = os.path.join(out_dir, "3_ucd_diagram.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 3_ucd_diagram.png")

# ==============================================================================
# 4. ERD DIAGRAM (Sơ Đồ Thực Thể Liên Kết 17 Bảng CSDL MySQL 8.0)
# ==============================================================================
def draw_erd():
    fig, ax = plt.subplots(figsize=(11.5, 8.0), dpi=300)
    ax.set_xlim(0, 11.5)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5.75, 8.1, "SƠ ĐỒ QUAN HỆ THỰC THỂ (ERD 17 BẢNG CSDL MYSQL 8.0 - 3NF)", 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')

    # Core Cluster
    rect_c = patches.FancyBboxPatch((0.4, 3.7), 10.7, 4.1, boxstyle="round,pad=0.1,rounding_size=0.15",
                                    linewidth=1.3, edgecolor='#0284C7', facecolor='#F0F9FF')
    ax.add_patch(rect_c)
    ax.text(0.7, 7.5, "PHÂN HỆ NGHIỆP VỤ TÀI CHÍNH CORE (9 BẢNG)", fontsize=9.5, fontweight='bold', color='#0369A1')

    # DSS Cluster
    rect_d = patches.FancyBboxPatch((0.4, 0.3), 10.7, 3.2, boxstyle="round,pad=0.1,rounding_size=0.15",
                                    linewidth=1.3, edgecolor='#9333EA', facecolor='#FAF5FF')
    ax.add_patch(rect_d)
    ax.text(0.7, 3.2, "PHÂN HỆ HỖ TRỢ RA QUYẾT ĐỊNH & AI ENGINE (8 BẢNG)", fontsize=9.5, fontweight='bold', color='#7E22CE')

    # Helper function to draw table box
    def draw_tbl(name, pk, fks, x, y, w=1.9, h=1.0, is_dss=False):
        bg = "#FFFFFF"
        hdr_bg = "#E9D5FF" if is_dss else "#BAE6FD"
        b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.04,rounding_size=0.08",
                                   linewidth=1.0, edgecolor='#64748B', facecolor=bg)
        ax.add_patch(b)
        h_box = patches.FancyBboxPatch((x, y + h - 0.28), w, 0.28, boxstyle="round,pad=0.02,rounding_size=0.06",
                                       linewidth=0.8, edgecolor='#64748B', facecolor=hdr_bg)
        ax.add_patch(h_box)
        ax.text(x + w/2, y + h - 0.14, name, fontsize=8, fontweight='bold', ha='center', va='center', color='#0F172A')
        
        info = f"PK: {pk}\n"
        if fks:
            info += f"FK: {fks}"
        ax.text(x + 0.1, y + 0.35, info, fontsize=6.8, va='center', color='#334155')

    # 9 Core Tables
    draw_tbl("wallets", "id", "user_id", 0.6, 6.2)
    draw_tbl("categories", "id", "parent_id", 2.8, 6.2)
    draw_tbl("transactions", "id", "wallet_id, cat_id", 5.0, 6.2, w=2.1)
    draw_tbl("recurring_tx", "id", "wallet_id, cat_id", 7.4, 6.2, w=2.0)
    draw_tbl("saving_goals", "id", "wallet_id", 9.6, 6.2, w=1.3)

    draw_tbl("budgets", "id", "-", 0.6, 4.1)
    draw_tbl("budget_categories", "id", "budget_id, cat_id", 2.8, 4.1, w=2.1)
    draw_tbl("debts", "id", "wallet_id", 5.2, 4.1)
    draw_tbl("debt_payments", "id", "debt_id, wallet_id", 7.4, 4.1, w=2.1)

    # 8 DSS Tables
    draw_tbl("ai_user_profiles", "id", "user_id", 0.6, 1.8, is_dss=True)
    draw_tbl("ai_recommendations", "id", "user_id, category_id", 2.8, 1.8, w=2.2, is_dss=True)
    draw_tbl("ai_anomalies", "id", "transaction_id", 5.3, 1.8, is_dss=True)
    draw_tbl("ai_cashflow_forecasts", "id", "user_id", 7.8, 1.8, w=2.2, is_dss=True)

    draw_tbl("ai_scenarios", "id", "user_id", 0.6, 0.5, is_dss=True)
    draw_tbl("ai_chat_sessions", "id", "user_id", 2.8, 0.5, is_dss=True)
    draw_tbl("ai_chat_messages", "id", "session_id", 5.1, 0.5, is_dss=True)
    draw_tbl("ai_configs", "id", "-", 7.8, 0.5, is_dss=True)

    # Relationship connectors
    ax.plot([1.6, 2.8], [6.7, 6.7], color='#0284C7', lw=1.2, linestyle=':')
    ax.plot([4.7, 5.0], [6.7, 6.7], color='#0284C7', lw=1.2)
    ax.plot([1.6, 2.8], [4.6, 4.6], color='#0284C7', lw=1.2)
    ax.plot([6.2, 7.4], [4.6, 4.6], color='#0284C7', lw=1.2)
    ax.plot([3.8, 5.1], [1.0, 1.0], color='#7E22CE', lw=1.2)
    ax.plot([6.0, 6.0], [5.0, 2.8], color='#DC2626', lw=1.2, linestyle='--')

    plt.tight_layout()
    file_path = os.path.join(out_dir, "4_erd_diagram.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 4_erd_diagram.png")

# ==============================================================================
# 5. OVERALL ACTIVITY DIAGRAM (Sơ Đồ Hoạt Động Tổng Thể Của Toàn Dự Án)
# ==============================================================================
def draw_overall_activity():
    fig, ax = plt.subplots(figsize=(11, 8.0), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5.5, 8.1, "SƠ ĐỒ HOẠT ĐỘNG TỔNG THỂ DỰ ÁN (OVERALL SYSTEM ACTIVITY WORKFLOW)", 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')

    # Start Node
    ax.plot([5.5], [7.6], marker='o', markersize=14, color='#0F172A')
    ax.text(5.5, 7.85, "Khởi Động Ứng Dụng", fontsize=8.5, ha='center', fontweight='bold', color='#0F172A')

    # Step 1: Auto-Init DB Check
    b1 = patches.FancyBboxPatch((3.8, 6.6), 3.4, 0.65, boxstyle="round,pad=0.08,rounding_size=0.1",
                                linewidth=1.2, edgecolor='#3B82F6', facecolor='#EFF6FF')
    ax.add_patch(b1)
    ax.text(5.5, 6.92, "Auto-Init Check:\nKiểm tra CSDL & Tự sinh 17 bảng nếu trống", fontsize=8, ha='center', va='center')
    ax.plot([5.5, 5.5], [7.5, 6.6], color='#64748B', lw=1.5)

    # Step 2: Load Dashboard
    b2 = patches.FancyBboxPatch((3.8, 5.5), 3.4, 0.65, boxstyle="round,pad=0.08,rounding_size=0.1",
                                linewidth=1.2, edgecolor='#10B981', facecolor='#ECFDF5')
    ax.add_patch(b2)
    ax.text(5.5, 5.82, "Tải Dashboard Chỉ Huy:\nTổng tài sản, Dòng tiền & Điểm sức khỏe", fontsize=8, ha='center', va='center')
    ax.plot([5.5, 5.5], [6.6, 5.5], color='#64748B', lw=1.5)

    # Branching Fork
    ax.plot([1.5, 9.5], [4.9, 4.9], color='#0F172A', lw=2.5)
    ax.plot([5.5, 5.5], [5.5, 4.9], color='#64748B', lw=1.5)

    # 4 Parallel Tracks
    tracks = [
        ("Nghiệp Vụ Hằng Ngày (TPS)", 0.6, 3.4, 2.1, "#EFF6FF", "#2563EB",
         "Ghi chép thu chi / Trả nợ\n-> Cập nhật tức thời số dư ví\n-> Giám sát hạn mức ngân sách"),
        ("Tự Động Quét & Cảnh Báo", 3.0, 3.4, 2.3, "#FEE2E2", "#DC2626",
         "Đánh giá điểm sức khỏe (Base 100)\n-> Quét chi tiêu bất thường (>2.5x)\n-> Đẩy thẻ cảnh báo màu hồng lên UI"),
        ("Hỗ Trợ Ra Quyết Định (1-Click)", 5.6, 3.4, 2.4, "#FEF3C7", "#D97706",
         "AI sinh khuyến nghị can thiệp\n-> Người dùng bấm 'Áp dụng 1-Click'\n-> Tự động điều chỉnh hạn mức/tiết kiệm"),
        ("Dự Báo & Mô Phỏng What-If", 8.2, 3.4, 2.3, "#F5F3FF", "#7C3AED",
         "Dự báo dòng tiền 3 tháng tới\n-> Nhập bài toán mua sắm tài sản lớn\n-> AI kết luận Khả thi / Rủi ro")
    ]

    for title, x, y, w, bg, border, content in tracks:
        ax.plot([x + w/2, x + w/2], [4.9, y + 1.2], color='#64748B', lw=1.2)
        b = patches.FancyBboxPatch((x, y), w, 1.2, boxstyle="round,pad=0.08,rounding_size=0.1",
                                   linewidth=1.2, edgecolor=border, facecolor=bg)
        ax.add_patch(b)
        ax.text(x + w/2, y + 1.0, title, fontsize=8, fontweight='bold', ha='center', color=border)
        ax.text(x + w/2, y + 0.45, content, fontsize=7.2, ha='center', va='center', color='#1E293B')

    # Join Bar
    ax.plot([1.5, 9.5], [2.7, 2.7], color='#0F172A', lw=2.5)
    for x, w in [(0.6, 2.1), (3.0, 2.3), (5.6, 2.4), (8.2, 2.3)]:
        ax.plot([x + w/2, x + w/2], [3.4, 2.7], color='#64748B', lw=1.2)

    # Step 3: Interactive Copilot Q&A
    b3 = patches.FancyBboxPatch((3.5, 1.4), 4.0, 0.75, boxstyle="round,pad=0.08,rounding_size=0.1",
                                linewidth=1.3, edgecolor='#8B5CF6', facecolor='#F3E8FF')
    ax.add_patch(b3)
    ax.text(5.5, 1.77, "Vấn Đáp Cùng Trợ Lý AI Copilot (RAG):\nTruy xuất dữ liệu thực tế & Tham vấn tài chính tự nhiên", 
            fontsize=8, ha='center', va='center', fontweight='bold', color='#4C1D95')
    ax.plot([5.5, 5.5], [2.7, 1.4], color='#64748B', lw=1.5)

    # End Node
    ax.plot([5.5], [0.6], marker='o', markersize=16, color='#0F172A')
    ax.plot([5.5], [0.6], marker='o', markersize=10, color='#FFFFFF')
    ax.text(5.5, 0.25, "Đóng Ứng Dụng (Lưu Trạng Thái MySQL An Toàn)", fontsize=8, ha='center', color='#475569')
    ax.plot([5.5, 5.5], [1.4, 0.6], color='#64748B', lw=1.5)

    plt.tight_layout()
    file_path = os.path.join(out_dir, "5_overall_activity.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 5_overall_activity.png")

if __name__ == "__main__":
    draw_architecture()
    draw_bfd()
    draw_ucd()
    draw_erd()
    draw_overall_activity()
    print("ALL 5 DIAGRAMS GENERATED SUCCESSFULLY!")
