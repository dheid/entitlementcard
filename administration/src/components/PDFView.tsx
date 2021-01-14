import React, {useEffect, useState} from "react";
import {jsPDF} from "jspdf";
import {drawjsPDF} from "../util/qrcode";
import logo from "./logo"

export default () => {
    const [pdfBlob, setPDFBlob] = useState<string | null>(null)

    useEffect(() => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        doc.setDocumentProperties({
            title: "Anmeldecode",
            subject: "Anmeldecode",
            author: "Bayern",
            creator: "Bayern"
        })
        
        const pageSize = doc.internal.pageSize
        const {width, height} = {width: pageSize.getWidth(), height: pageSize.getHeight()}
        const pageMargin = 20;
        const pageBottom = height - pageMargin;
        
        const logoSize = 25
        doc.addImage(logo, 'PNG', width / 2 - (logoSize / 2), pageMargin, logoSize, logoSize)
        doc.text("Ihre digitale Ehrenamtskarte ist da!", pageMargin, 60);
        
        doc.setFontSize(12)
        let instructionsY = 100;
        doc.text([
            'Anleitung:',
            "1. Laden Sie sich die App \"Ehrenamtskarte\" herunter.",
            "2. Starten Sie die App und folgenn Sie den Hinweisen zum Scannen des Anmeldecodes.",
            "3. Scannen Sie den Anmeldecode.",
        ], pageMargin, instructionsY);

       
        const qrCodeSize = 100;
        const qrCodeY = pageBottom - qrCodeSize - 40;
        const qrCodeMarginTop = 5
        doc.setFontSize(16)
        doc.text("Anmeldecode:", pageMargin, qrCodeY - qrCodeMarginTop);
        drawjsPDF("A".repeat(223), pageMargin, qrCodeY, qrCodeSize, doc)

        const playStoreUrl = "https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox";
        const appStoreUrl = "https://apps.apple.com/de/app/apple-store/id375380948";
        let storeQrCodeSize = 30;
        drawjsPDF(playStoreUrl, width - pageMargin - storeQrCodeSize, pageBottom - storeQrCodeSize, storeQrCodeSize,  doc, false, 5)
        drawjsPDF(appStoreUrl, width - pageMargin - 2 * storeQrCodeSize - 10, pageBottom - storeQrCodeSize, storeQrCodeSize, doc, false, 5)

        doc.setFontSize(12)
        doc.text("Play Store:", width - pageMargin - storeQrCodeSize, pageBottom - storeQrCodeSize - 2);
        doc.text("Apple Store:", width - pageMargin - 2 * storeQrCodeSize - 10, pageBottom - storeQrCodeSize - 2);

        setPDFBlob(doc.output('datauristring'))
    }, [])

    if (!pdfBlob) {
        return null
    }

    return (
        <iframe width="775" height="775" src={pdfBlob}/>
    );
}
