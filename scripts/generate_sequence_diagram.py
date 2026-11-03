import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

out_dir = r"d:\personal-finance\docs\diagrams"
os.makedirs(out_dir, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'

def draw_sequence_diagram():
    fig, ax = plt.subplots(figsize=(12, 10), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 14)
    ax.axis('off')

    # Title
    ax.text(6.0, 13.5, "SƠ ĐỒ TUẦN TỰ: CHỨC NĂNG MÔ PHỎNG WHAT-IF & DUYỆT 1-CLICK",
            fontsize=13, fontweight='bold', ha='center', color='#0F172A')
    ax.text(6.0, 13.1, "(UML Sequence Diagram - Personal Financial Decision Support System)",
            fontsize=9.5, ha='center', color='#475569', fontstyle='italic')

    # Participants Definition
    participants = [
        ("User\n(Người dùng)", 1.0, "#EFF6FF", "#1E40AF"),
        ("UI View\n(React 19)", 3.0, "#EFF6FF", "#2563EB"),
        ("IPC Main\n(Electron)", 5.2, "#ECFDF5", "#059669"),
        ("AiService\n(DSS Engine)", 7.4, "#FEF3C7", "#D97706"),
        ("MySQL DB\n(17 Bảng)", 9.5, "#F3E8FF", "#7C3AED"),
        ("Gemini AI\n(External)", 11.2, "#FEE2E2", "#DC2626")
    ]

    # Draw Lifelines & Headers
    for name, x, bg, border in participants:
        # Header Box
        hb = patches.FancyBboxPatch((x - 0.75, 12.0), 1.5, 0.75, boxstyle="round,pad=0.05,rounding_size=0.08",
                                    linewidth=1.2, edgecolor=border, facecolor=bg)
        ax.add_patch(hb)
        ax.text(x, 12.38, name, fontsize=8, fontweight='bold', ha='center', va='center', color='#0F172A')

        # Lifeline (vertical dashed line)
        ax.plot([x, x], [12.0, 0.6], color='#94A3B8', linestyle='--', lw=1.0, zorder=1)

        # Footer Box
        fb = patches.FancyBboxPatch((x - 0.75, 0.2), 1.5, 0.4, boxstyle="round,pad=0.05,rounding_size=0.06",
                                    linewidth=1.0, edgecolor=border, facecolor=bg)
        ax.add_patch(fb)

    # Helper function for drawing messages
    def msg(y, x1, x2, text, is_return=False, note=""):
        style = "<--" if is_return else "-->"
        ls = "--" if is_return else "-"
        color = "#64748B" if is_return else "#1E293B"
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.2, linestyle=ls))
        
        mid_x = (x1 + x2) / 2
        va = 'bottom' if not is_return else 'top'
        y_text = y + 0.1 if not is_return else y - 0.1
        ax.text(mid_x, y_text, text, fontsize=7.2, fontweight='bold' if not is_return else 'normal',
                ha='center', va=va, color='#0F172A' if not is_return else '#475569')
        if note:
            ax.text(mid_x, y - 0.25, note, fontsize=6.5, ha='center', color='#64748B', fontstyle='italic')

    # Self message (loopback)
    def self_msg(y, x, text):
        ax.plot([x, x + 0.5, x + 0.5, x], [y, y, y - 0.35, y - 0.35], color='#D97706', lw=1.2)
        ax.annotate("", xy=(x, y - 0.35), xytext=(x + 0.1, y - 0.35),
                    arrowprops=dict(arrowstyle="->", color='#D97706', lw=1.2))
        ax.text(x + 0.6, y - 0.18, text, fontsize=7.0, va='center', color='#92400E', fontweight='bold')

    # Activation bars
    def activate(x, y_start, y_end, color="#93C5FD"):
        h = y_start - y_end
        ab = patches.Rectangle((x - 0.08, y_end), 0.16, h, facecolor=color, edgecolor='#475569', lw=0.8, zorder=2)
        ax.add_patch(ab)

    # ================= Messages Flow =================
    # Step 1: User inputs & clicks simulate
    activate(1.0, 11.5, 11.1)
    msg(11.5, 1.0, 3.0, "1. Nhập thông số (Giá món đồ, Trả trước, Góp/tháng, Kỳ hạn)")
    msg(11.1, 1.0, 3.0, "2. Click [Chạy mô phỏng What-If]")

    # Step 2: UI calls IPC
    activate(3.0, 11.1, 8.2)
    msg(10.7, 3.0, 5.2, "3. invoke('ai:runScenario', payload)")

    # Step 3: IPC calls AiService
    activate(5.2, 10.7, 8.4)
    msg(10.3, 5.2, 7.4, "4. runScenario(payload)")

    # Step 4: AiService queries DB for current balances
    activate(7.4, 10.3, 8.6)
    msg(9.9, 7.4, 9.5, "5. SELECT SUM(balance) FROM wallets...")
    activate(9.5, 9.9, 9.5)
    msg(9.5, 9.5, 7.4, "6. Trả về: Số dư ví hiện có, Thu nhập & Chi tiêu tháng", is_return=True)

    # Step 5: Calculation
    self_msg(9.1, 7.4, "7. Tính dòng tiền từng tháng:\n   • Số dư sau trả trước\n   • Thặng dư = Thu - Chi - Góp")

    # Step 6: Call Gemini AI for Qualitative evaluation
    msg(8.4, 7.4, 11.2, "8. POST /models/gemini-3.5-flash:generateContent\n(Gửi bối cảnh dòng tiền + thông số giả định)")
    activate(11.2, 8.4, 7.8)
    msg(7.8, 11.2, 7.4, "9. Trả về: Đánh giá Khả thi / Rủi ro, Lập luận chi tiết", is_return=True)

    # Step 7: Save scenario to MySQL
    msg(7.4, 7.4, 9.5, "10. INSERT INTO ai_scenarios (name, parameters, result, status='pending')")
    activate(9.5, 7.4, 7.0)
    msg(7.0, 9.5, 7.4, "11. Record Saved (ID=101)", is_return=True)

    # Step 8: Return result back to UI
    msg(6.6, 7.4, 5.2, "12. Return Scenario Result", is_return=True)
    msg(6.2, 5.2, 3.0, "13. Return { success: true, data }", is_return=True)
    msg(5.8, 3.0, 1.0, "14. Hiển thị thẻ kết quả (Xanh: Khả thi / Đỏ: Nguy cơ cạn tiền)", is_return=True)

    # Alt Box: Quyết định người dùng (1-Click Apply vs Bỏ qua)
    alt_box = patches.Rectangle((0.4, 1.2), 11.3, 4.3, linewidth=1.5, edgecolor='#2563EB',
                                facecolor='#F8FAFC', linestyle='-', zorder=0)
    ax.add_patch(alt_box)
    
    # Tag 'alt'
    tag = patches.Polygon([[0.4, 5.5], [1.3, 5.5], [1.5, 5.15], [0.4, 5.15]], closed=True,
                          facecolor='#2563EB', edgecolor='#2563EB')
    ax.add_patch(tag)
    ax.text(0.85, 5.28, "alt", fontsize=8.5, fontweight='bold', color='#FFFFFF', ha='center')
    ax.text(1.7, 5.28, "[Trường hợp A: Người dùng đồng ý & Bấm 'Áp dụng quyết định' (1-Click)]", 
            fontsize=8, fontweight='bold', color='#1E40AF')

    # Step 15A: 1-Click Apply
    activate(1.0, 4.9, 4.5)
    msg(4.9, 1.0, 3.0, "15a. Click [Áp dụng quyết định 1-Click]")
    activate(3.0, 4.9, 2.8)
    msg(4.5, 3.0, 5.2, "16a. invoke('ai:applyScenario', id=101)")
    activate(5.2, 4.5, 3.0)
    msg(4.1, 5.2, 7.4, "17a. applyScenario(id=101)")
    activate(7.4, 4.1, 3.2)
    msg(3.7, 7.4, 9.5, "18a. UPDATE ai_scenarios SET status='applied'\nUPDATE budgets/wallets tương ứng")
    activate(9.5, 3.7, 3.3)
    msg(3.3, 9.5, 7.4, "19a. Success OK", is_return=True)
    msg(2.9, 7.4, 5.2, "20a. Return Success", is_return=True)
    msg(2.5, 5.2, 3.0, "21a. Resolution OK", is_return=True)
    msg(2.1, 3.0, 1.0, "22a. Toast thông báo: 'Đã áp dụng quyết định thành công!'", is_return=True)

    # Dividing line in alt box
    ax.plot([0.4, 11.7], [1.8, 1.8], color='#2563EB', linestyle='--', lw=1.0)
    ax.text(1.7, 1.6, "[Trường hợp B: Người dùng bấm 'Bỏ qua'] -> Ghi nhận status='dismissed', số dư không đổi", 
            fontsize=7.8, color='#64748B', fontstyle='italic')

    plt.tight_layout()
    file_path = os.path.join(out_dir, "6_sequence_what_if.png")
    plt.savefig(file_path, bbox_inches='tight', dpi=300)
    plt.close()
    print("Saved 6_sequence_what_if.png successfully!")

if __name__ == "__main__":
    draw_sequence_diagram()
