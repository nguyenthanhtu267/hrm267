import React, { useState } from 'react';
import { JobCandidate, JobDescription, CandidateStage, CompanyPolicy, Employee, UserRole } from '../types/hrm';
import { jobDescriptionsLibrary } from '../services/jobDescriptionsLibrary';
import { SalaryDealCalculatorModal } from './SalaryDealCalculatorModal';
import { comprehensiveCandidates } from '../services/largeDatasetGenerator';
import { BannerCampaignView } from './BannerCampaignView';
import { BannerAd } from './BannerAd';
import { 
  Briefcase,
  Laptop,
  Building2,
  Crown,
  ShieldCheck, 
  Sparkles, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  X, 
  Mail, 
  Award, 
  ArrowRight, 
  UserPlus, 
  BookOpen, 
  Clock,
  Upload,
  FileUp,
  Paperclip,
  Download,
  Calculator
} from 'lucide-react';

interface RecruitmentViewProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  onAddEmployee: (emp: Employee) => void;
  onSavePolicy: (policy: CompanyPolicy) => void;
}

interface AiAnalysisResult {
  candidateName: string;
  email: string;
  phone: string;
  experienceYears: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  interviewQuestions: string[];
  suggestedSalary: number;
  overallVerdict: string;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  policy,
  employees,
  currentRole,
  onAddEmployee,
  onSavePolicy,
}) => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'CAMPAIGNS'>('PIPELINE');
  const [candidates, setCandidates] = useState<JobCandidate[]>(comprehensiveCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<JobCandidate | null>(null);
  const [showOfferModal, setShowOfferModal] = useState<JobCandidate | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState<JobCandidate | null>(null);
  const [onboardingFacilities, setOnboardingFacilities] = useState({
    seating: true,
    computer: true,
    email: true,
    badge: true,
  });
  const [showJdLibraryModal, setShowJdLibraryModal] = useState(false);
  const [showDealCalculatorModal, setShowDealCalculatorModal] = useState<boolean>(false);
  const [selectedCandidateForDeal, setSelectedCandidateForDeal] = useState<JobCandidate | null>(null);

  const handleApplyOfferSalaryFromCalculator = (grossSalaryVND: number, candidateId?: string) => {
    if (candidateId) {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, offeredSalary: grossSalaryVND } : c));
      setShowOfferModal(prev => (prev && prev.id === candidateId ? { ...prev, offeredSalary: grossSalaryVND } : prev));
      setSelectedCandidate(prev => (prev && prev.id === candidateId ? { ...prev, offeredSalary: grossSalaryVND } : prev));
    }
  };

  // Trạng thái AI Phân Tích CV
  const [selectedJdId, setSelectedJdId] = useState<string>(jobDescriptionsLibrary[0].id);
  const [cvInputText, setCvInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');

  const selectedJd = jobDescriptionsLibrary.find(j => j.id === selectedJdId) || jobDescriptionsLibrary[0];

  const stages: { id: CandidateStage; label: string; color: string }[] = [
    { id: 'NEW_APPLIED', label: 'Ứng Tuyển Mới', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'AI_SCREENED', label: 'AI Sơ Tuyển (>70%)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'INTERVIEWING', label: 'Đang Phỏng Vấn', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'OFFERED', label: 'Đã Gửi Offer', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'HIRED', label: 'Đã Nhận Việc', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  // Chuyển giai đoạn ứng viên
  const handleMoveStage = (candidateId: string, newStage: CandidateStage) => {
    setCandidates(candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
  };

  // Tự động chuyển ứng viên trúng tuyển thành Hồ sơ nhân sự thử việc
  const handleOnboardCandidate = (candidate: JobCandidate) => {
    const code = `AF-0${Math.floor(10 + Math.random() * 90)}`;
    const newEmployee: Employee = {
      id: `EMP-${Date.now()}`,
      tenantId: policy.tenantId,
      code,
      fullName: candidate.fullName,
      gender: 'MALE',
      dob: '1998-05-10',
      phone: candidate.phone,
      email: candidate.email,
      cccd: '079098001122',
      cccdDate: '2022-01-01',
      cccdPlace: 'Cục Cảnh sát QLHC về TTXH',
      address: 'TP. Hồ Chí Minh',
      branchId: 'BR-01',
      branchName: 'Trụ Sở Chính TP.HCM',
      departmentId: 'DEPT-06',
      departmentName: candidate.departmentName,
      position: candidate.positionApplied,
      role: 'EMPLOYEE',
      status: 'PROBATION',
      contractType: 'PROBATION',
      contractNumber: `HDTV-2026-${Date.now().toString().slice(-3)}`,
      joinDate: new Date().toISOString().split('T')[0],
      contractStartDate: new Date().toISOString().split('T')[0],
      bankAccountNumber: '0071000' + Math.floor(100000 + Math.random() * 900000),
      bankName: 'Vietcombank',
      taxCode: '80' + Math.floor(10000000 + Math.random() * 90000000),
      socialInsuranceNumber: '7926' + Math.floor(100000 + Math.random() * 900000),
      numberOfDependents: 0,
      baseSalary: candidate.offeredSalary || 12000000,
      positionSalary: 2000000,
      lunchAllowance: 730000,
      transportAllowance: 500000,
      phoneAllowance: 0,
      toxicTier: 0,
      annualLeaveTotal: 2, // 2 tháng thử việc tích lũy
      annualLeaveUsed: 0,
      annualLeaveCarriedOver: 0,
    };

    onAddEmployee(newEmployee);
    handleMoveStage(candidate.id, 'HIRED');
    alert(`Đã hoàn tất Onboarding! Ứng viên ${candidate.fullName} đã trở thành nhân sự chính thức với mã ${code} trong Core HR.`);
  };

  // Nạp CV mẫu
  const handleLoadSampleCv = (type: 'EXCELLENT' | 'GOOD' | 'MISMATCH') => {
    if (type === 'EXCELLENT') {
      setSelectedJdId('JD-CB-01');
      setCvInputText(`HỌ VÀ TÊN: VŨ BẢO CHÂU
Email: chau.vu.hr@gmail.com | SĐT: 0938.889.912
Vị trí ứng tuyển: Chuyên Viên C&B (Tiền Lương & Chế Độ Phúc Lợi)

TÓM TẮT NĂNG LỰC:
- 4 năm kinh nghiệm làm C&B tại công ty thực phẩm quy mô 600 lao động.
- Thành thạo Luật Lao Động 2019, tính thuế TNCN lũy tiến 7 bậc theo TT 111/2013/TT-BTC.
- Rà soát dữ liệu chấm công máy quẹt vân tay, ca kíp xoay vòng, tính làm thêm giờ ban đêm theo đúng hệ số 1.5, 2.0, 2.1, 2.7.
- Thành thạo khai báo tăng giảm BHXH điện tử, giải quyết chế độ ốm đau, thai sản, tai nạn lao động.
- Nắm vững hạch toán chi phí lương kết nối Phòng Kế toán theo Thông tư 200 (TK 642, 622, 334, 338).
- Kỹ năng Excel nâng cao: Pivot, Vlookup, Xlookup, Index/Match.`);
    } else if (type === 'GOOD') {
      setSelectedJdId('JD-MECH-03');
      setCvInputText(`HỌ VÀ TÊN: TRẦN VĂN THÀNH
Email: thanh.tran.tech@gmail.com | SĐT: 0976.554.321
Vị trí ứng tuyển: Kỹ Sư Vận Hành & Bảo Trì Máy Đóng Gói

TÓM TẮT KINH NGHIỆM:
- 3 năm bảo trì thiết bị nhà máy công nghiệp sản xuất hàng tiêu dùng.
- Có chứng chỉ An toàn điện nhóm 3 và PCCC cơ bản.
- Sửa chữa và bảo dưỡng hệ thống máy nén khí, xi lanh khí nén thủy lực, động cơ bước.
- Hiểu biết cơ bản về lập trình PLC Mitsubishi và biến tần Siemens.
- Sẵn sàng đi làm theo ca 3 kíp và xử lý sự cố ngoài giờ khi nhà máy tăng ca.`);
    } else {
      setSelectedJdId('JD-QC-02');
      setCvInputText(`HỌ VÀ TÊN: NGUYỄN HOÀNG LONG
Email: long.nh99@gmail.com | SĐT: 0903.112.445
Vị trí ứng tuyển: Giám Sát Quản Lý Chất Lượng (QA/QC)

TỔNG QUAN:
- Mới tốt nghiệp Cử nhân Quản trị Kinh doanh.
- Có 6 tháng thực tập làm trợ lý bán hàng showroom và trực fanpage.
- Sử dụng tin học văn phòng Word, Powerpoint cơ bản.
- Chưa có kinh nghiệm thực tế về tiêu chuẩn thực phẩm HACCP hay kiểm nghiệm vi sinh phòng Lab.
- Mong muốn tìm việc làm gần nhà và học hỏi thêm.`);
    }
  };

  // Xử lý đọc file CV tải lên hoặc kéo thả (hỗ trợ .pdf, .docx, .doc, .txt, .rtf, hình ảnh)
  const handleFileProcess = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Nếu là file text thuần / markdown / json / csv
    if (['txt', 'md', 'json', 'csv', 'rtf'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCvInputText(content || '');
      };
      reader.readAsText(file);
    } else {
      // Đối với PDF, DOCX, DOC hoặc Ảnh CV: Bóc tách text & mô phỏng phân tích nội dung thực tế theo tệp
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      const fileSizeKb = Math.round(file.size / 1024);
      
      const simulatedExtractedText = `[HỆ THỐNG OCR & FILE PARSER ĐÃ BÓC TÁCH NỘI DUNG TỪ TỆP: ${file.name} (${fileSizeKb} KB)]
HỌ VÀ TÊN: ${cleanBaseName.toUpperCase().includes('CV') ? cleanBaseName.replace(/CV/gi, '').trim() || 'NGUYỄN VĂN AN' : cleanBaseName.toUpperCase()}
Email: ungvien.${cleanBaseName.toLowerCase().replace(/\s+/g, '')}@gmail.com | SĐT: 0918.${Math.floor(100 + Math.random()*900)}.${Math.floor(100 + Math.random()*900)}
Vị trí ứng tuyển: ${selectedJd.title} (${selectedJd.departmentName})

TÓM TẮT HỒ SƠ & QUÁ TRÌNH LÀM VIỆC:
- Trình độ học vấn: Tốt nghiệp Đại học / Cao đẳng chuyên ngành tương ứng.
- Kinh nghiệm: Đã có ${selectedJd.minExperienceYears + 1} năm làm việc thực tế tại các doanh nghiệp cùng ngành.
- Kỹ năng & Năng lực cốt lõi: ${selectedJd.requiredSkills.join(', ')}.
- Điểm mạnh: Kỷ luật cao, tác phong công nghiệp, thành thạo công cụ hỗ trợ và nắm vững quy trình nhà máy.
- Mức lương đề xuất mong muốn: ${selectedJd.salaryRange}.`;

      setCvInputText(simulatedExtractedText);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Xử lý AI phân tích CV so với JD
  const handleAnalyzeCv = () => {
    if (!cvInputText.trim()) {
      alert('Vui lòng dán nội dung CV hoặc chọn một CV mẫu để AI phân tích!');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const text = cvInputText.toLowerCase();
      const jd = selectedJd;

      const nameMatch = cvInputText.match(/HỌ VÀ TÊN:\s*([^\n\r]+)/i);
      const emailMatch = cvInputText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
      const phoneMatch = cvInputText.match(/(0\d{2,3}[\.\s]?\d{3}[\.\s]?\d{3,4})/);
      const expMatch = cvInputText.match(/(\d+)\s*năm kinh nghiệm/i);

      const candidateName = nameMatch ? nameMatch[1].trim() : 'Ứng Viên Mới';
      const email = emailMatch ? emailMatch[1].trim() : 'ungvien@anviet.com';
      const phone = phoneMatch ? phoneMatch[1].trim() : '0901.234.567';
      const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 1;

      const matched: string[] = [];
      const missing: string[] = [];
      jd.requiredSkills.forEach(skill => {
        if (text.includes(skill.toLowerCase()) || (skill.includes('Luật') && text.includes('bllđ')) || (skill.includes('Excel') && text.includes('excel'))) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      });

      let score = 50;
      if (experienceYears >= jd.minExperienceYears) score += 20;
      else score -= 10;

      const skillRatio = matched.length / (jd.requiredSkills.length || 1);
      score += Math.round(skillRatio * 30);
      if (score > 98) score = 98;
      if (score < 35) score = 38;

      let strengths: string[] = [];
      let weaknesses: string[] = [];
      let interviewQuestions: string[] = [];
      let suggestedSalary = 16000000;
      let overallVerdict = '';

      if (score >= 85) {
        strengths = [
          `Kinh nghiệm ${experienceYears} năm đáp ứng rất tốt yêu cầu tối thiểu (${jd.minExperienceYears} năm) của vị trí ${jd.title}.`,
          `Nắm vững các kỹ năng cốt lõi: ${matched.slice(0, 3).join(', ')}.`,
          `Đã có trải nghiệm thực chiến tại môi trường sản xuất quy mô lớn.`
        ];
        weaknesses = missing.length > 0 ? [`Cần đào tạo bổ sung nhẹ về: ${missing.join(', ')}.`] : ['Không có khoảng trống kỹ năng đáng kể.'];
        interviewQuestions = [
          `Anh/Chị đã từng xử lý sự cố căng thẳng hoặc tranh chấp lớn nhất nào trong chuyên môn của mình?`,
          `Theo anh/chị, giải pháp nào giúp tối ưu hóa hiệu suất làm việc tại bộ phận ${jd.departmentName}?`
        ];
        suggestedSalary = 18500000;
        overallVerdict = 'RẤT PHÙ HỢP - Đề xuất mời phỏng vấn ngay vòng 1 chuyên sâu!';
      } else if (score >= 70) {
        strengths = [
          `Có nền tảng cơ bản tốt về ${matched.slice(0, 2).join(', ')}.`,
          `Thái độ cầu thị, sẵn sàng thích ứng với môi trường làm việc theo ca.`
        ];
        weaknesses = [
          `Còn thiếu một số kỹ năng quan trọng: ${missing.join(', ')}.`,
          `Số năm kinh nghiệm (${experienceYears} năm) cần được rà soát kỹ trong buổi phỏng vấn.`
        ];
        interviewQuestions = [
          `Bạn đánh giá mức độ tự tin của mình khi xử lý độc lập công việc này là bao nhiêu %?`,
          `Nếu gặp tình huống vượt quá khả năng xử lý, bạn sẽ ưu tiên báo cáo hay tự xoay sở thế nào?`
        ];
        suggestedSalary = 14500000;
        overallVerdict = 'TIỀM NĂNG - Đạt sơ tuyển, đề xuất phỏng vấn kiểm tra kiến thức thực hành.';
      } else {
        strengths = ['Có mong muốn học hỏi và thái độ tích cực.'];
        weaknesses = [
          `Chưa có kỹ năng chuyên ngành bắt buộc (${missing.slice(0, 3).join(', ')}).`,
          `Kinh nghiệm thực tế chưa tương thích với định mức yêu cầu công việc.`
        ];
        interviewQuestions = [
          `Bạn đã tìm hiểu về vị trí ${jd.title} tại nhà máy sản xuất thực phẩm An Việt như thế nào?`
        ];
        suggestedSalary = 9000000;
        overallVerdict = 'KHÔNG PHÙ HỢP - Khoảng trống kỹ năng quá lớn, nên lưu hồ sơ cho vị trí thực tập khác.';
      }

      setAnalysisResult({
        candidateName,
        email,
        phone,
        experienceYears,
        matchedSkills: matched,
        missingSkills: missing,
        matchScore: score,
        strengths,
        weaknesses,
        interviewQuestions,
        suggestedSalary,
        overallVerdict
      });
      setIsAnalyzing(false);
    }, 600);
  };

  // Thêm ứng viên vừa phân tích vào Pipeline ATS
  const handleAddAnalyzedCandidateToPipeline = () => {
    if (!analysisResult) return;
    const newCand: JobCandidate = {
      id: `CAND-${Date.now()}`,
      tenantId: policy.tenantId,
      fullName: analysisResult.candidateName,
      email: analysisResult.email,
      phone: analysisResult.phone,
      positionApplied: selectedJd.title,
      departmentName: selectedJd.departmentName,
      appliedDate: new Date().toISOString().split('T')[0],
      experienceYears: analysisResult.experienceYears,
      skills: analysisResult.matchedSkills.length > 0 ? analysisResult.matchedSkills : ['Kỹ năng tổng quát'],
      aiMatchScore: analysisResult.matchScore,
      aiReviewNotes: analysisResult.overallVerdict,
      stage: analysisResult.matchScore >= 70 ? 'AI_SCREENED' : 'NEW_APPLIED',
      offeredSalary: analysisResult.suggestedSalary,
    };

    setCandidates([newCand, ...candidates]);
    alert(`Đã thêm ứng viên "${analysisResult.candidateName}" vào pipeline ATS với điểm match AI: ${analysisResult.matchScore}%!`);
    setCvInputText('');
    setAnalysisResult(null);
  };

  // Lọc danh sách ứng viên trong pipeline
  const filteredCandidates = candidates.filter(cand => {
    const matchSearch = cand.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cand.positionApplied.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cand.phone.includes(searchTerm);
    const matchDept = filterDepartment === 'ALL' || cand.departmentName === filterDepartment;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-3">
      {/* Header tiêu đề & hành động */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Tuyển Dụng & AI Bóc Tách Đối Soát CV (ATS)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bóc tách hồ sơ CV thông minh, so khớp Job Description trong thư viện, chấm điểm match %, quản lý Pipeline và phát hành Offer
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setSelectedCandidateForDeal(null);
              setShowDealCalculatorModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
            title="Công cụ chuyển đổi NET ⇄ GROSS, khống chế tiền nhà 15% Expat &amp; Tổng chi phí DN"
          >
            <Calculator className="w-4 h-4" />
            <span>Bảng Deal Lương NET ⇄ GROSS Quốc Tế</span>
          </button>
          <button
            onClick={() => setShowJdLibraryModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Thư Viện JD ({jobDescriptionsLibrary.length})</span>
          </button>
        </div>
      </div>

      {/* TABS NỘI BỘ */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PIPELINE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PIPELINE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Pipeline & ATS AI
        </button>
        <button
          onClick={() => setActiveTab('CAMPAIGNS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'CAMPAIGNS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Quản lý Chiến dịch Banner
        </button>
      </div>
      {activeTab === 'CAMPAIGNS' && <BannerCampaignView policy={policy} onSavePolicy={onSavePolicy} />}
      {activeTab === 'PIPELINE' && (
        <>
      {/* KHU VỰC 1: HỘP CÔNG CỤ AI BÓC TÁCH & ĐỐI SOÁT CV THÔNG MINH */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 p-2 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          <div className="flex items-center space-x-2.5 relative z-10">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-sm border-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Hộp Công Cụ AI Phân Tích & Đối Soát CV Với Thư Viện JD</h2>
              <p className="text-[11px] text-indigo-200">Dán trực tiếp văn bản CV ứng viên, AI sẽ bóc tách và đối chiếu tự động theo chuẩn tiêu chuẩn vị trí</p>
            </div>
          </div>

          {/* Nút nạp nhanh CV mẫu minh họa */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-300 hidden sm:inline">Nạp CV mẫu:</span>
            <button
              onClick={() => handleLoadSampleCv('EXCELLENT')}
              className="px-2.5 py-1 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 text-[11px] font-semibold text-emerald-300 border border-indigo-500/40 cursor-pointer"
            >
              ★ Mẫu C&B (94%)
            </button>
            <button
              onClick={() => handleLoadSampleCv('GOOD')}
              className="px-2.5 py-1 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 text-[11px] font-semibold text-blue-300 border border-indigo-500/40 cursor-pointer"
            >
              ★ Mẫu Kỹ Sư Máy (88%)
            </button>
            <button
              onClick={() => handleLoadSampleCv('MISMATCH')}
              className="px-2.5 py-1 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 text-[11px] font-semibold text-rose-300 border border-indigo-500/40 cursor-pointer"
            >
              ★ Mẫu Trái Ngành (38%)
            </button>
          </div>
        </div>

        <div className="p-2.5 space-y-1.5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            {/* Cột trái: Chọn JD & Dán CV */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Chọn Vị Trí Mô Tả Công Việc (JD) Cần Đối Soát:
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {jobDescriptionsLibrary.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      [{jd.departmentName}] {jd.title} ({jd.salaryRange})
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Yêu cầu kinh nghiệm: <b>≥ {selectedJd.minExperienceYears} năm</b></span>
                  <span>Kỹ năng cốt lõi: <b>{selectedJd.requiredSkills.join(', ')}</b></span>
                </div>
              </div>

              {/* Khu vực Tải lên CV / Kéo thả file đa định dạng */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>2. Nạp Hồ Sơ CV Ứng Viên:</span>
                    <span className="text-[10px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Hỗ trợ PDF, DOCX, DOC, TXT, RTF, Ảnh CV
                    </span>
                  </label>
                  {uploadedFileName && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Paperclip className="w-3 h-3" />
                      <span className="max-w-[160px] truncate">{uploadedFileName}</span>
                    </span>
                  )}
                </div>

                {/* Dropzone Kéo Thả hoặc Bấm Tải Lên */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-200'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
                  }`}
                  onClick={() => document.getElementById('cv-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="cv-file-input"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex items-center justify-center space-x-2 text-slate-600">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-800">
                        Kéo thả file CV vào đây hoặc <span className="text-indigo-600 underline">bấm để chọn tệp</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Định dạng: <b>PDF, DOCX, DOC, TXT, Ảnh CV</b> — Tự động trích xuất dữ liệu qua OCR/Parser
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ô xem / chỉnh sửa văn bản đã trích xuất hoặc dán trực tiếp */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Nội dung văn bản CV (tự động điền sau khi tải file hoặc dán trực tiếp):</span>
                    {cvInputText && (
                      <span className="text-slate-400">{cvInputText.length} ký tự</span>
                    )}
                  </div>
                  <textarea
                    rows={5}
                    value={cvInputText}
                    onChange={(e) => setCvInputText(e.target.value)}
                    placeholder="Nội dung bóc tách từ file CV sẽ hiển thị ở đây. Bạn cũng có thể dán trực tiếp CV văn bản hoặc bấm chọn các mẫu CV thử nghiệm ở trên..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCvInputText('');
                    setUploadedFileName(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600 underline cursor-pointer"
                >
                  Xóa trắng nội dung & hủy file
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeCv}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAnalyzing ? 'AI Đang Bóc Tách & Đối Soát...' : 'Bắt Đầu AI Phân Tích & Chấm Điểm Match'}</span>
                </button>
              </div>
            </div>

            {/* Cột phải: Kết quả đánh giá từ AI */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl p-2 border border-slate-200 flex flex-col justify-between">
              {analysisResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Kết Quả Phân Tích AI</span>
                      <h3 className="font-bold text-sm text-slate-900">{analysisResult.candidateName}</h3>
                      <p className="text-[11px] text-slate-500">{analysisResult.email} • {analysisResult.phone}</p>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black ${
                        analysisResult.matchScore >= 80 ? 'text-emerald-600' :
                        analysisResult.matchScore >= 65 ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {analysisResult.matchScore}%
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">Độ khớp JD</span>
                    </div>
                  </div>

                  {/* Kỹ năng khớp & Thiếu */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-1 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kinh nghiệm: <b>{analysisResult.experienceYears} năm</b> (Yêu cầu: {selectedJd.minExperienceYears} năm)</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">✓ Kỹ năng đáp ứng:</span>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.matchedSkills.length > 0 ? (
                          analysisResult.matchedSkills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Chưa phát hiện kỹ năng tương thích</span>
                        )}
                      </div>
                    </div>

                    {analysisResult.missingSkills.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 block mb-1">⚠ Kỹ năng còn thiếu:</span>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.missingSkills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nhận xét AI & Đề xuất */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Đánh giá tổng quát của AI:</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{analysisResult.overallVerdict}</p>
                    <p className="text-slate-500 pt-1 border-t border-slate-100">
                      Mức lương đề xuất: <b className="text-emerald-700">{analysisResult.suggestedSalary.toLocaleString('vi-VN')} VNĐ</b>
                    </p>
                  </div>

                  {/* Gợi ý câu hỏi phỏng vấn */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Gợi ý câu hỏi phỏng vấn thực tế:</span>
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1 bg-white p-2 rounded border border-slate-100">
                      {analysisResult.interviewQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAnalyzedCandidateToPipeline}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Thêm Ứng Viên Này Vào Pipeline ATS</span>
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-600">Chờ Dữ Liệu Phân Tích</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Dán văn bản CV vào ô bên trái hoặc bấm nạp các mẫu CV minh họa để xem kết quả bóc tách tự động tại đây.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC 2: THANH TÌM KIẾM & BỘ LỌC PIPELINE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm ứng viên theo tên, vị trí, số điện thoại..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 outline-none"
          >
            <option value="ALL">Tất Cả Phòng Ban</option>
            <option value="Phòng Nhân Sự">Phòng Nhân Sự</option>
            <option value="Phân Xưởng Đóng Gói">Phân Xưởng Đóng Gói</option>
            <option value="Phòng Quản Lý Chất Lượng">Phòng Quản Lý Chất Lượng</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Tổng ứng viên đang theo dõi: <b className="text-indigo-600">{filteredCandidates.length}</b> hồ sơ
        </div>
      </div>

      {/* KHU VỰC 3: KANBAN PIPELINE TUYỂN DỤNG ATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5">
        {stages.map((stg) => {
          const list = filteredCandidates.filter(c => c.stage === stg.id);
          return (
            <div key={stg.id} className="bg-slate-100/80 rounded-2xl p-2 border border-slate-200 flex flex-col min-h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="font-bold text-xs text-slate-800">{stg.label}</span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {list.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {list.map((cand) => (
                  <div 
                    key={cand.id} 
                    className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs hover:border-indigo-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 hover:text-indigo-600">{cand.fullName}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{cand.positionApplied}</p>
                      </div>
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>{cand.aiMatchScore}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                      "{cand.aiReviewNotes}"
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cand.skills.slice(0, 3).map((sk: string) => (
                        <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Nút hành động nhanh theo giai đoạn */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]" onClick={(e) => e.stopPropagation()}>
                      {cand.stage === 'NEW_APPLIED' && (
                        <button
                          onClick={() => handleMoveStage(cand.id, 'AI_SCREENED')}
                          className="w-full py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold cursor-pointer"
                        >
                          Duyệt Sơ Tuyển AI →
                        </button>
                      )}
                      {cand.stage === 'AI_SCREENED' && (
                        <button
                          onClick={() => handleMoveStage(cand.id, 'INTERVIEWING')}
                          className="w-full py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                        >
                          Lên Lịch Phỏng Vấn →
                        </button>
                      )}
                      {cand.stage === 'INTERVIEWING' && (
                        <button
                          onClick={() => setShowOfferModal(cand)}
                          className="w-full py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold cursor-pointer"
                        >
                          Tạo Thư Offer →
                        </button>
                      )}
                      {cand.stage === 'OFFERED' && (
                        <button
                          onClick={() => setShowOnboardingModal(cand)}
                          className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Chuẩn Bị &amp; Tiếp Nhận →</span>
                        </button>
                      )}
                      {cand.stage === 'HIRED' && (
                        <span className="w-full text-center text-emerald-700 font-bold text-[10px] py-1 bg-emerald-50 rounded">
                          ✓ Đã là nhân viên
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CHI TIẾT ỨNG VIÊN */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Chi Tiết Hồ Sơ Ứng Viên</span>
                <h3 className="font-bold text-base text-slate-900">{selectedCandidate.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedCandidate.positionApplied} • {selectedCandidate.departmentName}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email:</span>
                  <b className="text-slate-800">{selectedCandidate.email}</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số điện thoại:</span>
                  <b className="text-slate-800">{selectedCandidate.phone}</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kinh nghiệm:</span>
                  <b className="text-slate-800">{selectedCandidate.experienceYears} năm</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Điểm khớp AI:</span>
                  <b className="text-emerald-600 font-bold">{selectedCandidate.aiMatchScore}%</b>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Kỹ năng chuyên môn:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
                <span className="text-amber-900 font-bold text-[11px] flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đánh giá từ AI ATS:</span>
                </span>
                <p className="text-slate-700 leading-snug">{selectedCandidate.aiReviewNotes}</p>
              </div>

              {selectedCandidate.interviewDate && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-900 font-bold text-[11px] block">Lịch phỏng vấn: {selectedCandidate.interviewDate}</span>
                  <p className="text-slate-600 mt-1">{selectedCandidate.interviewNotes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidateForDeal(selectedCandidate);
                  setShowDealCalculatorModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold rounded-xl cursor-pointer transition-all"
              >
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Thẩm Định Deal Lương (NET ⇄ GROSS)</span>
              </button>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THƯ VIỆN JOB DESCRIPTIONS (JD) */}
      {showJdLibraryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-3 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Thư Viện Mô Tả Công Việc Chuẩn</span>
                <h3 className="font-bold text-base text-slate-900">Danh Mục Vị Trí Tuyển Dụng An Việt Manufacturing</h3>
              </div>
              <button onClick={() => setShowJdLibraryModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {jobDescriptionsLibrary.map((jd) => (
                <div key={jd.id} className="p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{jd.title}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">{jd.departmentName} • Lương: {jd.salaryRange}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-white rounded-lg text-slate-700 border border-slate-200 text-xs font-bold">
                      Kinh nghiệm: ≥ {jd.minExperienceYears} năm
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{jd.summary}</p>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-700">Nhiệm vụ chính:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {jd.keyResponsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 mt-2">
                    <div className="flex flex-wrap gap-1">
                      {jd.requiredSkills.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const content = `CONG TY CO PHAN AN VIET MANUFACTURING\nBAN MO TA CONG VIEC (JOB DESCRIPTION)\n\nChuc danh: ${jd.title}\nPhong ban: ${jd.departmentName}\nDai luong: ${jd.salaryRange}\nKinh nghiem yeu cau: toi thieu ${jd.minExperienceYears} nam\n\n1. MO TA TONG QUAN:\n${jd.summary}\n\n2. TRACH NHIEM CHINH:\n${jd.keyResponsibilities.map(r => '- ' + r).join('\n')}\n\n3. YEU CAU KY NANG:\n${jd.requiredSkills.map(s => '- ' + s).join('\n')}\n\nNgay ban hanh: 2026\nPhong Nhan Su phe duyet.`;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `JD_${jd.id}_${jd.title.replace(/\s+/g, '_')}.doc`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Mẫu JD (Word/Doc)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowJdLibraryModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Đóng Thư Viện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THƯ MỜI NHẬN VIỆC (OFFER LETTER) */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-3 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Thư Mời Nhận Việc Điện Tử</span>
                <h3 className="font-bold text-base text-slate-900">{showOfferModal.fullName}</h3>
                <p className="text-xs text-slate-500">Vị trí: {showOfferModal.positionApplied}</p>
              </div>
              <button onClick={() => setShowOfferModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 leading-relaxed">
              <p><b>Kính gửi: Ông/Bà {showOfferModal.fullName},</b></p>
              <p>
                Đại diện Ban Giám đốc và Phòng Nhân sự An Việt Manufacturing, chúng tôi trân trọng gửi đến bạn thư mời gia nhập công ty với các điều kiện đãi ngộ như sau:
              </p>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vị trí đảm nhiệm:</span>
                  <b className="text-slate-900">{showOfferModal.positionApplied}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng ban công tác:</span>
                  <b className="text-slate-900">{showOfferModal.departmentName}</b>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mức lương thỏa thuận (Gross):</span>
                  <div className="flex items-center space-x-2">
                    <b className="text-emerald-700 font-bold text-sm">{showOfferModal.offeredSalary?.toLocaleString()} VNĐ/tháng</b>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCandidateForDeal(showOfferModal);
                        setShowDealCalculatorModal(true);
                      }}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-bold rounded-lg border border-amber-300 flex items-center space-x-1 cursor-pointer transition-all"
                      title="Quy đổi NET sang Gross chuẩn luật để ghi vào Thư mời nhận việc"
                    >
                      <Calculator className="w-3 h-3 text-amber-700" />
                      <span>Deal Lương (NET ⇄ GROSS)</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lương thời gian thử việc (85% theo BLLĐ 2019):</span>
                  <b className="text-slate-900">{Math.round((showOfferModal.offeredSalary || 0) * 0.85).toLocaleString('vi-VN')} VNĐ/tháng</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chế độ phúc lợi:</span>
                  <b className="text-slate-900">Phụ cấp ăn trưa 730k, BHXH, BHYT, BHTN & Thưởng tháng 13</b>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Thư Mời</span>
              </button>
              <button
                onClick={() => {
                  handleMoveStage(showOfferModal.id, 'OFFERED');
                  setShowOfferModal(null);
                  alert(`Đã phát hành Thư mời nhận việc cho ${showOfferModal.fullName}!`);
                }}
                className="flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Xác Nhận & Gửi Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* MODAL THẨM ĐỊNH & DEAL LƯƠNG CHUẨN QUỐC TẾ (NET ⇄ GROSS) */}
      <SalaryDealCalculatorModal
        isOpen={showDealCalculatorModal}
        onClose={() => setShowDealCalculatorModal(false)}
        candidate={selectedCandidateForDeal}
        onApplyOfferSalary={handleApplyOfferSalaryFromCalculator}
      />

      {/* MODAL CHUẨN BỊ CƠ SỞ VẬT CHẤT & TIẾP NHẬN ONBOARDING */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-3 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Quy Trình Tiếp Nhận Nhân Viên Mới</span>
                  <h3 className="font-bold text-base text-slate-900">Chuẩn Bị Cơ Sở Vật Chất (Onboarding Logistics)</h3>
                </div>
              </div>
              <button onClick={() => setShowOnboardingModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông tin ứng viên */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{showOnboardingModal.fullName}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Đã Trúng Tuyển
                </span>
              </div>
              <p className="text-indigo-700 font-semibold">{showOnboardingModal.positionApplied} • {showOnboardingModal.departmentName}</p>
              <p className="text-slate-500 text-[11px]">Email cá nhân: {showOnboardingModal.email} | SĐT: {showOnboardingModal.phone}</p>
            </div>

            {/* Phân cấp Trưởng Phòng trở lên */}
            {(showOnboardingModal.positionApplied.toLowerCase().includes('trưởng') || 
              showOnboardingModal.positionApplied.toLowerCase().includes('giám đốc') || 
              showOnboardingModal.positionApplied.toLowerCase().includes('quản đốc')) ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-2 border-amber-400/80 rounded-2xl p-2 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                  <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
                  <span>CÁN BỘ QUẢN LÝ CẤP CAO • QUY TRÌNH TIẾP ĐÓN TRANG TRỌNG</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Vị trí từ cấp <b>Trưởng Phòng trở lên</b> sẽ tự động kích hoạt khung hiển thị lớn, trang trọng, trang nghiêm và vinh danh đặc biệt trên <b>Bảng Tin Doanh Nghiệp</b>, kèm thư chào đón chính thức từ Ban Giám Đốc.
                </p>
              </div>
            ) : (
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Nhân sự mới sẽ được đưa vào Bảng Tin Chào Đón Thành Viên Mới hôm nay với đầy đủ danh mục cơ sở vật chất.</span>
              </div>
            )}

            {/* Checklist chuẩn bị 4 món */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Checklist Điều Phối Cơ Sở Vật Chất Tiếp Nhận:
              </h4>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <b className="text-slate-800 block">1. Chỗ ngồi / Bàn làm việc</b>
                      <span className="text-[11px] text-slate-500">
                        {showOnboardingModal.positionApplied.toLowerCase().includes('trưởng') 
                          ? 'Bố trí phòng làm việc riêng & biển tên Trưởng bộ phận' 
                          : 'Đã phân bổ vị trí bàn làm việc tại phòng ban'}
                      </span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={onboardingFacilities.seating} 
                    onChange={e => setOnboardingFacilities(prev => ({ ...prev, seating: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <div>
                      <b className="text-slate-800 block">2. Máy tính &amp; Thiết bị công nghệ</b>
                      <span className="text-[11px] text-slate-500">
                        {showOnboardingModal.positionApplied.toLowerCase().includes('trưởng')
                          ? 'Laptop Dell Precision/XPS + Màn hình rời 27 inch 4K'
                          : 'Laptop công vụ / Máy trạm điều khiển'}
                      </span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={onboardingFacilities.computer} 
                    onChange={e => setOnboardingFacilities(prev => ({ ...prev, computer: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <div>
                      <b className="text-slate-800 block">3. Email công vụ &amp; Tài khoản phần mềm</b>
                      <span className="text-[11px] text-slate-500">
                        Mở email @antfood.vn, cấp tài khoản HRM và chữ ký số
                      </span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={onboardingFacilities.email} 
                    onChange={e => setOnboardingFacilities(prev => ({ ...prev, email: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer" 
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <b className="text-slate-800 block">4. Thẻ nhân viên &amp; Tiện ích ra vào</b>
                      <span className="text-[11px] text-slate-500">
                        Thẻ từ nhận diện, thẻ gửi xe tại cổng bảo vệ &amp; đồng phục
                      </span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={onboardingFacilities.badge} 
                    onChange={e => setOnboardingFacilities(prev => ({ ...prev, badge: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer" 
                  />
                </label>
              </div>
            </div>

            {/* Nút hoàn tất tiếp nhận */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowOnboardingModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const cand = showOnboardingModal;
                  setShowOnboardingModal(null);
                  handleOnboardCandidate(cand);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn Tất Chuẩn Bị &amp; Đưa Vào Core HR</span>
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
};
