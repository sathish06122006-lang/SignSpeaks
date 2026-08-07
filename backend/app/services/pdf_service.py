import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_conversation_pdf(title: str, text: str, history: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], textColor=colors.HexColor("#4338CA")
    )

    elements = [
        Paragraph("Sign Speaks – Conversation Export", title_style),
        Spacer(1, 0.3 * cm),
        Paragraph(f"Title: {title}", styles["Normal"]),
        Paragraph(f"Exported: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
        Spacer(1, 0.5 * cm),
        Paragraph("Detected Text", styles["Heading2"]),
        Paragraph(text or "(no text)", styles["Normal"]),
        Spacer(1, 0.5 * cm),
        Paragraph("Detection History", styles["Heading2"]),
    ]

    if history:
        data = [["#", "Sign", "Confidence"]]
        for i, entry in enumerate(history, start=1):
            conf = entry.get("confidence", 0)
            data.append([str(i), entry.get("sign", ""), f"{conf * 100:.0f}%"])
        table = Table(data, colWidths=[1.5 * cm, 6 * cm, 4 * cm])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4338CA")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ]
            )
        )
        elements.append(table)
    else:
        elements.append(Paragraph("No detection history recorded.", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
