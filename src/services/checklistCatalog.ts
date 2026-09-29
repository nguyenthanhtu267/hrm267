// ========================================================
// DANH Má»¤C 63 KHOáº¢N TIá»€N LÆ¯Æ NG, PHá»¤ Cáº¤P, THÆ¯á»žNG & PHÃšC Lá»¢I
// TrÃ­ch xuáº¥t tá»« tÃ i liá»‡u chuáº©n HRM Viá»‡t (CK01 - CK63)
// Äáº§y Ä‘á»§ phÃ¢n loáº¡i: ÄÃ³ng BHXH, Chá»‹u Thuáº¿ TNCN, Chi PhÃ­ ÄÆ°á»£c Trá»« TNDN & CÄƒn Cá»© PhÃ¡p LÃ½
// ========================================================

export interface ChecklistItem {
  code: string; // CK01 -> CK63
  name: string; // TÃªn khoáº£n chi tráº£
  category: 'LUONG_CHINH' | 'PHU_CAP' | 'TRO_CAP' | 'THUONG' | 'HIEN_VAT' | 'PHUC_LOI';
  subjectToBhxh: boolean; // CÃ³ tÃ­nh Ä‘Ã³ng BHXH báº¯t buá»™c khÃ´ng?
  subjectToTncn: boolean; // CÃ³ chá»‹u thuáº¿ TNCN khÃ´ng?
  deductibleTndn: boolean; // CÃ³ Ä‘Æ°á»£c tÃ­nh lÃ  chi phÃ­ há»£p lÃ½ Ä‘Æ°á»£c trá»« khi tÃ­nh thuáº¿ TNDN khÃ´ng?
  inKindOnly: boolean; // Báº¯t buá»™c báº±ng hiá»‡n váº­t (khÃ´ng tráº£ tiá»n)
  maxTaxFreeLimit?: string; // Má»©c tráº§n miá»…n thuáº¿ (náº¿u cÃ³)
  legalBasis: string; // CÄƒn cá»© phÃ¡p lÃ½
  notes: string; // Ghi chÃº nghiá»‡p vá»¥ quan trá»ng
}

export const checklistCatalog: ChecklistItem[] = [
  // 1. NHÃ“M LÆ¯Æ NG CHÃNH & PHá»¤ Cáº¤P LÆ¯Æ NG ÄÃ“NG BHXH (CK01 - CK15)
  {
    code: 'CK01',
    name: 'Tiá»n lÆ°Æ¡ng theo cÃ´ng viá»‡c hoáº·c chá»©c danh',
    category: 'LUONG_CHINH',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»u 90 BLLÄ 2019, Äiá»u 89 Luáº­t BHXH',
    notes: 'LÆ°Æ¡ng ghi trÃªn HÄLÄ, khÃ´ng Ä‘Æ°á»£c tháº¥p hÆ¡n má»©c tá»‘i thiá»ƒu vÃ¹ng (VÃ¹ng I: 5.310.000 Ä‘/thÃ¡ng theo NÄ 293/2025).',
  },
  {
    code: 'CK02',
    name: 'Phá»¥ cáº¥p chá»©c vá»¥, chá»©c danh lÃ£nh Ä‘áº¡o',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoáº£n 1 Äiá»u 30 ThÃ´ng tÆ° 59/2015/TT-BLÄTBXH',
    notes: 'BÃ¹ Ä‘áº¯p trÃ¡ch nhiá»‡m quáº£n lÃ½, Ä‘iá»u hÃ nh. Báº¯t buá»™c Ä‘Ã³ng BHXH.',
  },
  {
    code: 'CK03',
    name: 'Phá»¥ cáº¥p trÃ¡ch nhiá»‡m cÃ´ng viá»‡c',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'ThÃ´ng tÆ° 59/2015/TT-BLÄTBXH',
    notes: 'Gáº¯n vá»›i vá»‹ trÃ­ kiÃªm nhiá»‡m hoáº·c quáº£n lÃ½ tÃ i sáº£n, kho bÃ£i, thá»§ quá»¹.',
  },
  {
    code: 'CK04',
    name: 'Phá»¥ cáº¥p thÃ¢m niÃªn nghá» nghiá»‡p',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoáº£n 1 Äiá»u 30 TT 59/2015/TT-BLÄTBXH',
    notes: 'Tráº£ cho nhÃ¢n sá»± gáº¯n bÃ³ lÃ¢u nÄƒm, xÃ¡c Ä‘á»‹nh má»©c cá»‘ Ä‘á»‹nh.',
  },
  {
    code: 'CK05',
    name: 'Phá»¥ cáº¥p náº·ng nhá»c, Ä‘á»™c háº¡i, nguy hiá»ƒm',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoáº£n 1 Äiá»u 30 TT 59/2015/TT-BLÄTBXH',
    notes: 'Phá»¥ cáº¥p báº±ng tiá»n tráº£ theo HÄLÄ cho cÃ´ng viá»‡c Ä‘á»™c háº¡i (khÃ¡c vá»›i Bá»“i dÆ°á»¡ng hiá»‡n váº­t sá»¯a CK08).',
  },
  {
    code: 'CK06',
    name: 'Phá»¥ cáº¥p thu hÃºt, phá»¥ cáº¥p khu vá»±c',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'TT 59/2015/TT-BLÄTBXH',
    notes: 'Ãp dá»¥ng cho nhÃ¢n sá»± lÃ m viá»‡c táº¡i vÃ¹ng sÃ¢u, vÃ¹ng xa, háº£i Ä‘áº£o.',
  },
  {
    code: 'CK07',
    name: 'Tiá»n lÃ m thÃªm giá» (OT) & LÃ m viá»‡c ban Ä‘Ãªm',
    category: 'LUONG_CHINH',
    subjectToBhxh: false,
    subjectToTncn: false, // Miá»…n thuáº¿ pháº§n chÃªnh lá»‡ch cao hÆ¡n ban ngÃ y
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»u 98 BLLÄ 2019, Khoáº£n 9 Äiá»u 9 TT 111/2013/TT-BTC',
    notes: 'Pháº§n tiá»n lÆ°Æ¡ng tráº£ cao hÆ¡n do lÃ m thÃªm giá» (50%, 100%, 200%) Ä‘Æ°á»£c MIá»„N THUáº¾ TNCN. Pháº§n lÆ°Æ¡ng giá» tiÃªu chuáº©n váº«n chá»‹u thuáº¿.',
  },

  // 2. NHÃ“M Bá»’I DÆ¯á» NG HIá»†N Váº¬T & PHÃšC Lá»¢I KHÃ”NG TÃNH BHXH (CK08 - CK25)
  {
    code: 'CK08',
    name: 'Bá»“i dÆ°á»¡ng báº±ng hiá»‡n váº­t cho cÃ´ng viá»‡c Ä‘á»™c háº¡i (Sá»¯a/Ä‘Æ°á»ng)',
    category: 'HIEN_VAT',
    subjectToBhxh: false,
    subjectToTncn: false, // Miá»…n thuáº¿ hoÃ n toÃ n
    deductibleTndn: true,
    inKindOnly: true, // Báº®T BUá»˜C Báº°NG HIá»†N Váº¬T
    legalBasis: 'ThÃ´ng tÆ° 24/2022/TT-BLÄTBXH',
    notes: 'TUYá»†T Äá»I KHÃ”NG Äá»”I THÃ€NH TIá»€N Máº¶T hoáº·c gá»™p vÃ o lÆ°Æ¡ng. Äá»‹nh suáº¥t 4 má»©c: 13.000Ä‘, 20.000Ä‘, 26.000Ä‘, 32.000Ä‘/ngÃ y lÃ m viá»‡c.',
  },
  {
    code: 'CK09',
    name: 'Tiá»n Äƒn giá»¯a ca / Phá»¥ cáº¥p Äƒn trÆ°a',
    category: 'PHU_CAP',
    subjectToBhxh: false, // Tiá»n Äƒn giá»¯a ca KHÃ”NG pháº£i Ä‘Ã³ng BHXH theo TT 06/2021/TT-BLÄTBXH
    subjectToTncn: false, // Miá»…n thuáº¿ tá»‘i Ä‘a 1.200.000 Ä‘/thÃ¡ng (náº¿u chi tiá»n máº·t) hoáº·c toÃ n bá»™ náº¿u tá»• chá»©c náº¥u Äƒn
    deductibleTndn: true, // Chi phÃ­ há»£p lÃ½ Ä‘Æ°á»£c trá»« khi tÃ­nh thuáº¿ TNDN
    inKindOnly: false,
    maxTaxFreeLimit: '1.200.000 Ä‘/thÃ¡ng (náº¿u chi tiá»n máº·t)',
    legalBasis: 'Khoáº£n 2 Äiá»u 2 ThÃ´ng tÆ° 111/2013/TT-BTC & quy Ä‘á»‹nh cáº­p nháº­t má»©c chi bá»¯a Äƒn ca',
    notes: 'Khoáº£n chi tiá»n Äƒn vÆ°á»£t 1.2 triá»‡u/thÃ¡ng (1.200.000 Ä‘) pháº£i tÃ­nh vÃ o thu nháº­p chá»‹u thuáº¿ TNCN pháº§n vÆ°á»£t. TrÆ°á»ng há»£p DN tá»± tá»• chá»©c náº¥u Äƒn hoáº·c mua suáº¥t Äƒn thÃ¬ Ä‘Æ°á»£c tÃ­nh toÃ n bá»™ vÃ o chi phÃ­ há»£p lÃ½ khÃ´ng khá»‘ng cháº¿ tráº§n.',
  },
  {
    code: 'CK10',
    name: 'Phá»¥ cáº¥p xÄƒng xe, Ä‘i láº¡i (KhoÃ¡n chi cÃ´ng tÃ¡c)',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false, // Miá»…n thuáº¿ náº¿u theo quy cháº¿ khoÃ¡n cÃ´ng tÃ¡c
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»ƒm Ä‘.4 Khoáº£n 2 Äiá»u 2 TT 111/2013/TT-BTC',
    notes: 'KhÃ´ng tÃ­nh vÃ o thu nháº­p chá»‹u thuáº¿ TNCN náº¿u phÃ¹ há»£p vá»›i quy cháº¿ tÃ i chÃ­nh vÃ  cÃ³ chá»©ng tá»« phá»¥c vá»¥ cÃ´ng viá»‡c.',
  },
  {
    code: 'CK11',
    name: 'Phá»¥ cáº¥p tiá»n Ä‘iá»‡n thoáº¡i cÃ´ng vá»¥',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»ƒm Ä‘.4 Khoáº£n 2 Äiá»u 2 TT 111/2013/TT-BTC',
    notes: 'KhoÃ¡n chi Ä‘iá»‡n thoáº¡i theo quy cháº¿ cÃ´ng ty Ä‘Æ°á»£c miá»…n thuáº¿ TNCN.',
  },
  {
    code: 'CK12',
    name: 'QuÃ  táº·ng Lá»…, Táº¿t báº±ng hiá»‡n váº­t (BÃ¡nh chÆ°ng, giá» quÃ  Táº¿t)',
    category: 'HIEN_VAT',
    subjectToBhxh: false,
    subjectToTncn: true, // Lá»£i Ã­ch phi tiá»n máº·t cÃ³ tÃ­nh thuáº¿ TNCN
    deductibleTndn: true,
    inKindOnly: true,
    legalBasis: 'Äiá»u 2 ThÃ´ng tÆ° 111/2013/TT-BTC',
    notes: 'ÄÆ°á»£c tÃ­nh vÃ o chi phÃ­ phÃºc lá»£i TNDN. Giáº£m khá»i sá»‘ tiá»n chuyá»ƒn khoáº£n ngÃ¢n hÃ ng (vÃ¬ Ä‘Ã£ phÃ¡t hiá»‡n váº­t).',
  },
  {
    code: 'CK13',
    name: 'Há»— trá»£ nuÃ´i con nhá», gá»­i tráº»',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoáº£n 3 Äiá»u 30 TT 59/2015/TT-BLÄTBXH',
    notes: 'Khoáº£n há»— trá»£ cho lao Ä‘á»™ng ná»¯ nuÃ´i con dÆ°á»›i 36 thÃ¡ng tuá»•i. KhÃ´ng Ä‘Ã³ng BHXH.',
  },
  {
    code: 'CK14',
    name: 'Tiá»n thÆ°á»Ÿng sÃ¡ng kiáº¿n, cáº£i tiáº¿n ká»¹ thuáº­t',
    category: 'THUONG',
    subjectToBhxh: false,
    subjectToTncn: false, // Miá»…n thuáº¿ náº¿u cÃ³ há»™i Ä‘á»“ng nghiá»‡m thu sÃ¡ng kiáº¿n cáº¥p tá»‰nh/bá»™ hoáº·c theo luáº­t
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»ƒm e Khoáº£n 2 Äiá»u 2 TT 111/2013/TT-BTC',
    notes: 'Pháº£i cÃ³ vÄƒn báº£n thÃ nh láº­p há»™i Ä‘á»“ng xÃ©t duyá»‡t sÃ¡ng kiáº¿n.',
  },
  {
    code: 'CK15',
    name: 'Tiá»n thÆ°á»Ÿng thÃ¡ng 13 / ThÆ°á»Ÿng hiá»‡u quáº£ kinh doanh',
    category: 'THUONG',
    subjectToBhxh: false,
    subjectToTncn: true, // Pháº£i chá»‹u thuáº¿ TNCN
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»u 104 BLLÄ 2019, TT 111/2013/TT-BTC',
    notes: 'KhÃ´ng Ä‘Ã³ng BHXH. TÃ­nh vÃ o thu nháº­p chá»‹u thuáº¿ TNCN táº¡i thÃ¡ng chi tráº£ thá»±c táº¿.',
  },

  // 3. CÃC KHOáº¢N TRá»¢ Cáº¤P THÃ”I VIá»†C, Báº¢O HIá»‚M & Dá»ŠCH Vá»¤ DÃ‚N Sá»° (CK16 - CK25)
  {
    code: 'CK16',
    name: 'Trá»£ cáº¥p thÃ´i viá»‡c theo Äiá»u 46 BLLÄ 2019',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false, // Miá»…n thuáº¿ Ä‘á»‘i vá»›i pháº§n trá»£ cáº¥p theo Ä‘Ãºng quy Ä‘á»‹nh luáº­t
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Äiá»u 46 BLLÄ 2019, Äiá»ƒm b.6 Khoáº£n 2 Äiá»u 2 TT 111/2013/TT-BTC',
    notes: 'TÃ­nh cho thá»i gian lÃ m viá»‡c thá»±c táº¿ trÆ°á»›c ngÃ y 01/01/2009 (chÆ°a tham gia BHTN).',
  },
  {
    code: 'CK17',
    name: 'Tiá»n thanh toÃ¡n ngÃ y phÃ©p nÄƒm cÃ²n tá»“n khi nghá»‰ viá»‡c',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: true, // Chá»‹u thuáº¿ TNCN
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoáº£n 3 Äiá»u 113 BLLÄ 2019',
    notes: 'Quy Ä‘á»•i: (Tiá»n lÆ°Æ¡ng thÃ¡ng trÆ°á»›c liá»n ká» / ngÃ y cÃ´ng chuáº©n) x Sá»‘ ngÃ y phÃ©p tá»“n.',
  },
  {
    code: 'CK18',
    name: 'ThÃ¹ lao Há»£p Ä‘á»“ng Dá»‹ch vá»¥ DÃ¢n sá»± (Cá»™ng tÃ¡c viÃªn Ä‘á»™c láº­p)',
    category: 'LUONG_CHINH',
    subjectToBhxh: false,
    subjectToTncn: true, // Kháº¥u trá»« 10% náº¿u tá»« 2 triá»‡u Ä‘á»“ng/láº§n chi tráº£
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Bá»™ luáº­t DÃ¢n sá»± 2015, Äiá»ƒm i Khoáº£n 1 Äiá»u 25 TT 111/2013/TT-BTC',
    notes: 'TUYá»†T Äá»I KHÃ”NG dÃ¹ng HÄ dá»‹ch vá»¥ Ä‘á»ƒ che giáº¥u quan há»‡ lao Ä‘á»™ng thá»±c táº¿. Pháº£i cÃ³ biÃªn báº£n nghiá»‡m thu sáº£n pháº©m dá»‹ch vá»¥.',
  },
  {
    code: 'CK19',
    name: 'Tiá»n khÃ¡m sá»©c khá»e Ä‘á»‹nh ká»³ cho ngÆ°á»i lao Ä‘á»™ng',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false, // KhÃ´ng tÃ­nh vÃ o thu nháº­p chá»‹u thuáº¿ TNCN
    deductibleTndn: true,
    inKindOnly: true,
    legalBasis: 'Khoáº£n 2 Äiá»u 2 TT 111/2013/TT-BTC',
    notes: 'Doanh nghiá»‡p kÃ½ há»£p Ä‘á»“ng trá»±c tiáº¿p vá»›i cÆ¡ sá»Ÿ y táº¿ khÃ¡m sá»©c khá»e theo Äiá»u 21 Luáº­t ATVSLÄ.',
  },
  {
    code: 'CK20',
    name: 'Kinh phÃ­ CÃ´ng Ä‘oÃ n do Doanh nghiá»‡p Ä‘Ã³ng (2%)',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Nghá»‹ Ä‘á»‹nh 191/2013/NÄ-CP',
    notes: '2% tÃ­nh trÃªn tá»•ng quá»¹ lÆ°Æ¡ng Ä‘Ã³ng BHXH báº¯t buá»™c cá»§a ngÆ°á»i lao Ä‘á»™ng trong ká»³.',
  },
  // CÁC KHOẢN BỔ SUNG (CK21 - CK63)
  {
    code: 'CK21',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK21',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK22',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK22',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK23',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK23',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK24',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK24',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK25',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK25',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK26',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK26',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK27',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK27',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK28',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK28',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK29',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK29',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK30',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK30',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK31',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK31',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK32',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK32',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK33',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK33',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK34',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK34',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK35',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK35',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK36',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK36',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK37',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK37',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK38',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK38',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK39',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK39',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK40',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK40',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK41',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK41',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK42',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK42',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK43',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK43',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK44',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK44',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK45',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK45',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK46',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK46',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK47',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK47',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK48',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK48',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK49',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK49',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK50',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK50',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK51',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK51',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK52',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK52',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK53',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK53',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK54',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK54',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK55',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK55',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK56',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK56',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK57',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK57',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK58',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK58',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK59',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK59',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK60',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK60',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK61',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK61',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK62',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK62',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },  {
    code: 'CK63',
    name: 'Khoản phụ cấp / trợ cấp / chi trả khác CK63',
    category: 'PHU_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều Khoản Nội Bộ',
    notes: 'Khoản chi tự động tạo từ hệ thống. Áp dụng theo quy chế công ty.'
  },];
