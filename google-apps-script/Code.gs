/**
 * ============================================================
 *  Google Apps Script Backend - Nitipcatip Jasa Titip (Neo Brutalism Edition)
 * ============================================================
 */

var SPREADSHEET_ID = ""; // Kosongkan untuk pakai spreadsheet aktif.
var SHEET_NAME = "Pesanan";  
var DRIVE_FOLDER_NAME = "Nitipcatip Lampiran";

var HEADERS = [
  "Order ID",
  "Timestamp",
  "Status",
  "Nama Pemesan",
  "WhatsApp",
  "Email",
  "Nama Barang",
  "Link Produk",
  "Ukuran Produk",
  "Warna",
  "Quantity",
  "Harga Barang",
  "Size Order",
  "Fee Jastip",
  "Ongkir",
  "Total Pembayaran",
  "Kota Tujuan",
  "Kode Pos",
  "Catatan",
  "Lampiran URL",
  "Lampiran Name"
];

// ─── POST HANDLER ─────────────────────────────────────────────
function doPost(e) {
  var result = { success: false };
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();

    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    // Check for admin action: Update Status
    if (data.action === "updateStatus") {
      var orderId = data.orderId;
      var newStatus = data.status;
      var rows = sheet.getDataRange().getValues();
      var found = false;

      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === orderId) { // Column 1: Order ID
          sheet.getRange(i + 1, 3).setValue(newStatus); // Column 3: Status
          found = true;
          break;
        }
      }

      if (found) {
        result.success = true;
        result.message = "Status order " + orderId + " berhasil diupdate ke " + newStatus;
      } else {
        result.success = false;
        result.error = "Order ID tidak ditemukan: " + orderId;
      }
    } else {
      // Normal flow: Save new order
      var lampiranLink = handleFileUpload(data);

      sheet.appendRow([
        data.orderId           || "",
        data.timestamp         || "",
        "Pending", // Default status
        data.namaPemesan       || "",
        data.whatsapp          || "",
        data.email             || "",
        data.namaBarang        || "",
        data.linkProduk        || "-",
        data.ukuranVarian      || "-",
        data.warna             || "-",
        Number(data.jumlah)    || 1,
        Number(data.hargaBarang)   || 0,
        data.sizeOrder         || "small",
        Number(data.feeJastip)     || 0,
        Number(data.estimasiOngkir) || 0,
        Number(data.totalPembayaran) || 0,
        data.kotaTujuan        || "",
        data.kodePos           || "",
        data.catatan           || "-",
        lampiranLink           || "-",
        data.lampiranName      || "-"
      ]);

      var lastRow = sheet.getLastRow();
      // Format currency fields: Harga Barang, Fee Jastip, Ongkir, Total Pembayaran
      sheet.getRange(lastRow, 12).setNumberFormat("\"Rp \"#,##0"); // Harga Barang
      sheet.getRange(lastRow, 14, 1, 3).setNumberFormat("\"Rp \"#,##0"); // Fee, Ongkir, Total

      // Alternate row backgrounds
      if (lastRow % 2 === 0) {
        sheet.getRange(lastRow, 1, 1, HEADERS.length).setBackground("#FFF8FB");
      }

      result.success = true;
      result.message = "Pesanan berhasil dicatat.";
      result.orderId = data.orderId;
    }
  } catch (error) {
    result.success = false;
    result.error = error.toString();
    console.error("doPost error:", error);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── GET HANDLER ──────────────────────────────────────────────
function doGet(e) {
  var result = {};
  try {
    var sheet = getOrCreateSheet();
    var action = e.parameter.action;

    if (action === "getOrders") {
      var rows = sheet.getDataRange().getValues();
      var orders = [];

      // Check if sheet has data beside headers
      if (rows.length > 1) {
        for (var i = 1; i < rows.length; i++) {
          var row = rows[i];
          orders.push({
            id: row[0],
            timestamp: row[1],
            status: row[2],
            namaPemesan: row[3],
            whatsapp: row[4],
            email: row[5],
            namaBarang: row[6],
            linkProduk: row[7],
            ukuranVarian: row[8],
            warna: row[9],
            jumlah: Number(row[10]),
            hargaBarang: Number(row[11]),
            sizeOrder: row[12],
            feeJastip: Number(row[13]),
            estimasiOngkir: Number(row[14]),
            totalPembayaran: Number(row[15]),
            kotaTujuan: row[16],
            kodePos: row[17],
            catatan: row[18],
            lampiranUrl: row[19],
            lampiranName: row[20]
          });
        }
      }
      result = { success: true, orders: orders };
    } else {
      // Standard health check
      result = {
        status: "ok",
        service: "Nitipcatip Google Apps Script API",
        timestamp: new Date().toISOString(),
        totalOrders: Math.max(0, sheet.getLastRow() - 1)
      };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── HELPERS ──────────────────────────────────────────────────
function getOrCreateSheet() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function setupHeaders(sheet) {
  sheet.appendRow(HEADERS);
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange
    .setFontWeight("bold")
    .setFontColor("#000000")
    .setBackground("#FF69B4") // Pink primary style
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function handleFileUpload(data) {
  if (!data.lampiranUrl) return "";

  if (data.lampiranUrl.indexOf("data:") === 0) {
    try {
      var parts   = data.lampiranUrl.split(",");
      var mime    = parts[0].match(/:(.*?);/)[1];
      var b64data = parts[1];
      var blob    = Utilities.newBlob(
        Utilities.base64Decode(b64data),
        mime,
        data.lampiranName || ("lampiran_" + new Date().getTime())
      );

      var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return file.getUrl();
    } catch (uploadError) {
      console.error("File upload failed:", uploadError);
      return "Upload gagal: " + uploadError.message;
    }
  }

  return data.lampiranUrl;
}
