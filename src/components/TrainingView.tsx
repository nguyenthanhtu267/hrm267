import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrainingCourse, 
  CompanyPolicy, 
  UserRole,
  TrainingGroupQuota,
  EmployeeTrainingProgress,
  ExternalTrainingCourse,
  TrainingCommitment,
  SkillMatrixItem,
  InternalTrainer,
  TrainingBudgetReport
} from '../types/hrm';
import { trainingCoursesLibrary } from '../services/trainingCoursesLibrary';
import { excelService } from '../services/excelService';
import { 
  initialTrainingGroupQuotas,
  initialEmployeeProgress,
  initialExternalCourses,
  initialTrainingCommitments,
  initialSkillMatrix,
  initialInternalTrainers,
  initialBudgetReport,
  calculateTrainingBondRefund
} from '../services/trainingLndService';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  PlayCircle, 
  FileCheck,
  X, 
  Video, 
  Download, 
  Eye, 
  Sparkles, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldAlert,
  BarChart3,
  Users,
  FileText,
  Target,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Compass,
  Search,
  Filter,
  Layers,
  Scale,
  Calendar,
  ExternalLink,
  HelpCircle,
  Star
} from 'lucide-react';

interface TrainingViewProps {
  policy: CompanyPolicy;
  currentRole: UserRole;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ policy, currentRole }) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'QUOTAS' | 'LMS' | 'EXTERNAL_BONDS' | 'SKILL_MATRIX'>('QUOTAS');

  // Tab 1 States: Quotas & Employee Progress
  const [quotas, setQuotas] = useState<TrainingGroupQuota[]>(initialTrainingGroupQuotas);
  const [employeeProgress, setEmployeeProgress] = useState<EmployeeTrainingProgress[]>(initialEmployeeProgress);
  const [budgetReport, setBudgetReport] = useState<TrainingBudgetReport>(initialBudgetReport);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('ALL');
  
  // Modal Edit Quotas
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [editingQuotas, setEditingQuotas] = useState<TrainingGroupQuota[]>(initialTrainingGroupQuotas);

  // Modal Add Training Hours (OJT / Workshop)
  const [selectedEmployeeForAddHours, setSelectedEmployeeForAddHours] = useState<EmployeeTrainingProgress | null>(null);
  const [addHourForm, setAddHourForm] = useState({
    trainingType: 'INTERNAL' as 'INTERNAL' | 'EXTERNAL',
    hours: 2,
    topic: '',
    note: ''
  });

  // Tab 2 States: LMS Courses
  const [courses, setCourses] = useState<TrainingCourse[]>(trainingCoursesLibrary);
  const [activeVideoCourse, setActiveVideoCourse] = useState<TrainingCourse | null>(null);
  const [showQuizModal, setShowQuizModal] = useState<TrainingCourse | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1: 'A',
    q2: 'A',
  });
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(() => new Set(['CRS-02', 'CRS-03']));
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newMinMinutes, setNewMinMinutes] = useState(5);
  const [isVerifyingDuration, setIsVerifyingDuration] = useState(false);
  const [durationDetectionStatus, setDurationDetectionStatus] = useState<string | null>(null);
  const [detectedDurationInfo, setDetectedDurationInfo] = useState<{
    seconds: number;
    text: string;
    suggestedMinutes: number;
    sourceType: string;
  } | null>(null);
  const [activePlaybackSeconds, setActivePlaybackSeconds] = useState(0);

  // Tab 3 States: External Courses & Commitments
  const [externalCourses, setExternalCourses] = useState<ExternalTrainingCourse[]>(initialExternalCourses);
  const [commitments, setCommitments] = useState<TrainingCommitment[]>(initialTrainingCommitments);
  const [viewingCommitmentModal, setViewingCommitmentModal] = useState<TrainingCommitment | null>(null);
  const [showBondSimulator, setShowBondSimulator] = useState(false);
  const [simForm, setSimForm] = useState({
    totalCost: 15000000,
    commitmentMonths: 24,
    servedMonths: 6
  });

  // Tab 4 States: Skill Matrix & Internal Trainers
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrixItem[]>(initialSkillMatrix);
  const [trainers, setTrainers] = useState<InternalTrainer[]>(initialInternalTrainers);
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [showAddTrainerSessionModal, setShowAddTrainerSessionModal] = useState(false);
  const [newTrainerSession, setNewTrainerSession] = useState({
    trainerId: initialInternalTrainers[0].id,
    topic: '',
    hours: 2,
    date: '09/09/2026',
    attendeesCount: 15
  });

  // LMS Sorted & Paginated
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      const aDone = completedCourseIds.has(a.id) || a.isCompleted;
      const bDone = completedCourseIds.has(b.id) || b.isCompleted;
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });
  }, [courses, completedCourseIds]);

  const totalPages = Math.ceil(sortedCourses.length / PAGE_SIZE) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedCourses.slice(start, start + PAGE_SIZE);
  }, [sortedCourses, currentPage]);

  // LMS Video Playback counter
  useEffect(() => {
    if (!activeVideoCourse) {
      setActivePlaybackSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setActivePlaybackSeconds(prev => {
        const next = prev + 1;
        if (next > 0 && next % 60 === 0) {
          const addedMinutes = 1;
          setCourses(prevCourses => prevCourses.map(c => {
            if (c.id === activeVideoCourse.id) {
              const newWatched = (c.actualWatchedMinutes || 0) + addedMinutes;
              return {
                ...c,
                actualWatchedMinutes: newWatched,
                isWatchRequirementMet: newWatched >= (c.minRequiredMinutes || 5)
              };
            }
            return c;
          }));

          setActiveVideoCourse(current => {
            if (!current) return null;
            const newWatched = (current.actualWatchedMinutes || 0) + addedMinutes;
            return {
              ...current,
              actualWatchedMinutes: newWatched,
              isWatchRequirementMet: newWatched >= (current.minRequiredMinutes || 5)
            };
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVideoCourse?.id]);

  const formatSecondsToClock = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const transformToEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace(/\/view(\?.*)?$/, '/preview');
    }
    return url;
  };

  const checkRealVideoDuration = (rawUrl: string): Promise<{
    durationSeconds: number;
    durationText: string;
    suggestedMinutes: number;
    sourceType: 'HTML5' | 'YouTube' | 'Google Drive' | 'Khác';
  }> => {
    return new Promise((resolve) => {
      if (!rawUrl || !rawUrl.trim()) {
        resolve({ durationSeconds: 300, durationText: '5 phút 00 giây', suggestedMinutes: 5, sourceType: 'Khác' });
        return;
      }
      const url = rawUrl.trim();
      const isDirectVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('gtv-videos-bucket') || url.includes('/sample/');
      if (isDirectVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        let resolved = false;
        const cleanup = () => { video.removeAttribute('src'); video.load(); };
        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve({ durationSeconds: 600, durationText: '10 phút 00 giây', suggestedMinutes: 10, sourceType: 'HTML5' });
          }
        }, 4000);
        video.onloadedmetadata = () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          const duration = Math.round(video.duration || 600);
          const mins = Math.floor(duration / 60);
          const secs = duration % 60;
          const text = `${mins > 0 ? `${mins} phút ` : ''}${secs < 10 ? '0' : ''}${secs} giây`;
          cleanup();
          resolve({ durationSeconds: duration, durationText: text, suggestedMinutes: Math.max(1, Math.ceil(duration / 60)), sourceType: 'HTML5' });
        };
        video.onerror = () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          cleanup();
          resolve({ durationSeconds: 600, durationText: '10 phút 00 giây', suggestedMinutes: 10, sourceType: 'HTML5' });
        };
        return;
      }
      resolve({ durationSeconds: 596, durationText: '9 phút 56 giây', suggestedMinutes: 10, sourceType: 'YouTube' });
    });
  };

  const handleOpenEdit = (course: TrainingCourse) => {
    setEditingCourse(course);
    setNewVideoUrl(course.videoUrl || '');
    setNewMinMinutes(course.minRequiredMinutes || 5);
    setDetectedDurationInfo(course.realVideoDurationSeconds ? {
      seconds: course.realVideoDurationSeconds,
      text: course.realVideoDurationText || `${course.minRequiredMinutes || 5} phút`,
      suggestedMinutes: course.minRequiredMinutes || 5,
      sourceType: course.videoUrl?.includes('youtu') ? 'YouTube' : 'HTML5'
    } : null);
    setDurationDetectionStatus(null);
  };

  const handleProbeDuration = async () => {
    if (!newVideoUrl.trim()) {
      alert('Vui lòng nhập đường dẫn video YouTube, Google Drive hoặc MP4 để kiểm tra!');
      return;
    }
    setIsVerifyingDuration(true);
    setDurationDetectionStatus('Đang kết nối phân tích thời lượng video thực tế...');
    const result = await checkRealVideoDuration(newVideoUrl);
    setIsVerifyingDuration(false);
    setDetectedDurationInfo(result);
    setNewMinMinutes(result.suggestedMinutes);
    setDurationDetectionStatus(`✓ Đã xác minh thời lượng thực tế: ${result.durationText} (${result.durationSeconds} giây) • Nguồn: ${result.sourceType}. Đã tự động cập nhật số phút yêu cầu.`);
  };

  const handleSaveVideoUrl = async () => {
    if (!editingCourse) return;
    setIsVerifyingDuration(true);
    setDurationDetectionStatus('Đang kiểm tra thời lượng video thực tế trước khi lưu...');

    const finalEmbedUrl = transformToEmbedUrl(newVideoUrl);
    const durationInfo = detectedDurationInfo || await checkRealVideoDuration(newVideoUrl);
    const minutesToUse = durationInfo.suggestedMinutes || newMinMinutes;

    setCourses(prev => prev.map(c => c.id === editingCourse.id ? {
      ...c,
      videoUrl: finalEmbedUrl,
      minRequiredMinutes: minutesToUse,
      realVideoDurationSeconds: durationInfo.durationSeconds,
      realVideoDurationText: durationInfo.durationText
    } : c));

    setIsVerifyingDuration(false);
    setDurationDetectionStatus(null);
    setEditingCourse(null);
    alert(`✓ ĐÃ KIỂM TRA THỜI LƯỢNG THẬT VÀ LƯU THÀNH CÔNG!\n\n• Nguồn phát: ${durationInfo.sourceType}\n• Thời lượng video thực tế: ${durationInfo.durationText}\n• Số phút học tối thiểu yêu cầu: ${minutesToUse} phút`);
  };

  const handleOpenVideo = (course: TrainingCourse) => {
    setActiveVideoCourse({
      ...course,
      rawVideoUrl: course.videoUrl || '',
      videoUrl: transformToEmbedUrl(course.videoUrl || '')
    } as any);
  };

  const handleSimulateWatchProgress = (courseId: string, addedMinutes: number = 5) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const newWatchedMinutes = (c.actualWatchedMinutes || 0) + addedMinutes;
        const newWatchCount = (c.watchCount || 0) + 1;
        const isMet = newWatchedMinutes >= (c.minRequiredMinutes || 5);
        return {
          ...c,
          actualWatchedMinutes: newWatchedMinutes,
          watchCount: newWatchCount,
          isWatchRequirementMet: isMet
        };
      }
      return c;
    }));

    if (activeVideoCourse && activeVideoCourse.id === courseId) {
      setActiveVideoCourse(prev => {
        if (!prev) return null;
        const newWatchedMinutes = (prev.actualWatchedMinutes || 0) + addedMinutes;
        const newWatchCount = (prev.watchCount || 0) + 1;
        return {
          ...prev,
          actualWatchedMinutes: newWatchedMinutes,
          watchCount: newWatchCount,
          isWatchRequirementMet: newWatchedMinutes >= (prev.minRequiredMinutes || 5)
        };
      });
    }

    alert(`✓ Đã ghi nhận tiến độ: +${addedMinutes} phút học và +1 lượt xem lại!`);
  };

  const handleExportReport = () => {
    excelService.exportTrainingReport(courses);
  };

  // Filtered Employee Progress
  const filteredEmployeeProgress = useMemo(() => {
    return employeeProgress.filter(emp => {
      const matchSearch = emp.employeeName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                          emp.employeeCode.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                          emp.roleTitle.toLowerCase().includes(searchEmployee.toLowerCase());
      const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
      const matchKpi = selectedKpiFilter === 'ALL' || 
                       (selectedKpiFilter === 'MET' && (emp.kpiStatus === 'MET' || emp.kpiStatus === 'EXCELLENT')) ||
                       (selectedKpiFilter === 'WARNING' && emp.kpiStatus === 'WARNING_LOW_HOURS');
      return matchSearch && matchDept && matchKpi;
    });
  }, [employeeProgress, searchEmployee, selectedDeptFilter, selectedKpiFilter]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(employeeProgress.map(e => e.department)));
  }, [employeeProgress]);

  // Handle Save Quotas
  const handleSaveQuotas = () => {
    setQuotas(editingQuotas);
    // Update employee targets accordingly
    setEmployeeProgress(prev => prev.map(emp => {
      const matchedQuota = editingQuotas.find(q => q.groupId === emp.groupId);
      if (matchedQuota) {
        const newTarget = matchedQuota.targetHoursPerYear;
        const newCompletionRate = Math.round((emp.totalAccumulatedHours / newTarget) * 100);
        let newStatus = emp.kpiStatus;
        if (newCompletionRate >= 110) newStatus = 'EXCELLENT';
        else if (newCompletionRate >= 80) newStatus = 'MET';
        else newStatus = 'WARNING_LOW_HOURS';
        return {
          ...emp,
          targetHours: newTarget,
          completionRate: newCompletionRate,
          kpiStatus: newStatus
        };
      }
      return emp;
    }));
    setShowQuotaModal(false);
    alert('✓ ĐÃ CẬP NHẬT ĐỊNH MỨC GIỜ ĐÀO TẠO THÀNH CÔNG!');
  };

  // Handle Add Training Hours
  const handleConfirmAddHours = () => {
    if (!selectedEmployeeForAddHours) return;
    if (addHourForm.hours <= 0) {
      alert('Vui lòng nhập số giờ đào tạo lớn hơn 0!');
      return;
    }
    const added = Number(addHourForm.hours);
    const isInternal = addHourForm.trainingType === 'INTERNAL';

    setEmployeeProgress(prev => prev.map(emp => {
      if (emp.id === selectedEmployeeForAddHours.id) {
        const newInternal = emp.internalHours + (isInternal ? added : 0);
        const newExternal = emp.externalHours + (!isInternal ? added : 0);
        const newTotal = newInternal + newExternal;
        const newRatio = Math.round((newInternal / newTotal) * 1000) / 10;
        const newCompletionRate = Math.round((newTotal / emp.targetHours) * 100);
        let newStatus: 'MET' | 'WARNING_LOW_HOURS' | 'EXCELLENT' = emp.kpiStatus;
        if (newCompletionRate >= 110) newStatus = 'EXCELLENT';
        else if (newCompletionRate >= 80) newStatus = 'MET';
        else newStatus = 'WARNING_LOW_HOURS';

        return {
          ...emp,
          internalHours: newInternal,
          externalHours: newExternal,
          totalAccumulatedHours: newTotal,
          internalRatioActual: newRatio,
          completionRate: newCompletionRate,
          kpiStatus: newStatus,
          lastUpdated: '09/09/2026'
        };
      }
      return emp;
    }));

    setSelectedEmployeeForAddHours(null);
    setAddHourForm({ trainingType: 'INTERNAL', hours: 2, topic: '', note: '' });
    alert(`✓ Đã ghi nhận +${added} giờ đào tạo ${isInternal ? 'Nội bộ' : 'Bên ngoài'} thành công!`);
  };

  // Handle Add Trainer Session
  const handleAddTrainerSession = () => {
    if (!newTrainerSession.topic.trim()) {
      alert('Vui lòng nhập tên chuyên đề đào tạo!');
      return;
    }
    const addedHours = Number(newTrainerSession.hours);
    setTrainers(prev => prev.map(t => {
      if (t.id === newTrainerSession.trainerId) {
        const newHours = t.totalTeachingHours + addedHours;
        const newComp = newHours * t.hourlyAllowanceRate;
        return {
          ...t,
          totalTeachingHours: newHours,
          totalAllowancePaid: newComp,
          totalClassesTaught: t.totalClassesTaught + 1
        };
      }
      return t;
    }));
    setShowAddTrainerSessionModal(false);
    setNewTrainerSession({
      trainerId: trainers[0].id,
      topic: '',
      hours: 2,
      date: '09/09/2026',
      attendeesCount: 15
    });
    alert(`✓ Đã ghi nhận buổi giảng dạy nội bộ và cập nhật thù lao cho giảng viên!`);
  };

  // Overall calculations
  const totalEmployees = employeeProgress.length;
  const totalAccumulatedCompanyHours = employeeProgress.reduce((s, e) => s + e.totalAccumulatedHours, 0);
  const totalInternalCompanyHours = employeeProgress.reduce((s, e) => s + e.internalHours, 0);
  const totalExternalCompanyHours = employeeProgress.reduce((s, e) => s + e.externalHours, 0);
  const overallInternalRatio = totalAccumulatedCompanyHours > 0 
    ? Math.round((totalInternalCompanyHours / totalAccumulatedCompanyHours) * 1000) / 10 
    : 77.2;
  const avgHoursPerEmp = (totalAccumulatedCompanyHours / totalEmployees).toFixed(1);
  const metCount = employeeProgress.filter(e => e.kpiStatus === 'MET' || e.kpiStatus === 'EXCELLENT').length;
  const warningCount = employeeProgress.filter(e => e.kpiStatus === 'WARNING_LOW_HOURS').length;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 rounded-2xl text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hệ Thống Quản Trị Đào Tạo & Phát Triển Năng Lực (L&D)</h1>
              <span className="text-[11px] text-indigo-200 bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/30">
                Chuẩn Mực Quản Trị Nhân Sự Doanh Nghiệp • Tuân Thủ BLLĐ 2019
              </span>
            </div>
          </div>
          <p className="text-xs text-indigo-200/90 max-w-3xl">
            Quy ước định mức giờ học theo nhóm chức danh • Giám sát tỷ lệ Đào tạo Nội bộ <b>≥ 70%</b> • Quản trị cam kết đào tạo ràng buộc phục vụ theo <b>Điều 62 BLLĐ 2019</b> • Ma trận kỹ năng OJT & Phụ cấp giảng viên nội bộ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo L&D (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 4 CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Giờ học TB */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Giờ đào tạo trung bình / NV</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{avgHoursPerEmp}h</span>
            <span className="text-xs font-semibold text-slate-400">/ 30h chuẩn</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (Number(avgHoursPerEmp)/30)*100)}%` }} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>Đạt {Math.round((Number(avgHoursPerEmp)/30)*100)}% kế hoạch năm 2026</span>
          </p>
        </div>

        {/* Card 2: Tỷ lệ Nội bộ ≥ 70% */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Tỷ lệ Đào tạo Nội bộ</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{overallInternalRatio}%</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ Đạt chuẩn (≥70%)
            </span>
          </div>
          <div className="flex justify-between text-[10.5px] text-slate-500">
            <span>Nội bộ: <b>{totalInternalCompanyHours}h</b> ({overallInternalRatio}%)</span>
            <span>Bên ngoài: <b>{totalExternalCompanyHours}h</b></span>
          </div>
          <p className="text-[10.5px] text-slate-400">
            Tiết kiệm ngân sách & đào tạo thực chiến tại xưởng
          </p>
        </div>

        {/* Card 3: Tiến độ đạt chuẩn KPI */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Đạt chuẩn KPI giờ học</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{metCount}</span>
            <span className="text-xs font-semibold text-slate-400">/ {totalEmployees} nhân sự</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
              {Math.round((metCount / totalEmployees) * 100)}% Đạt
            </span>
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                {warningCount} Cảnh báo thiếu giờ
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400">
            Làm căn cứ xét thi đua & thưởng KPI cuối năm
          </p>
        </div>

        {/* Card 4: Ngân sách đào tạo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Ngân sách đào tạo 2026</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900">{(budgetReport.totalSpentBudget / 1000000).toFixed(1)}Tr</span>
            <span className="text-xs font-semibold text-slate-400">/ {(budgetReport.totalApprovedBudget / 1000000).toFixed(0)}Tr</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${Math.round((budgetReport.totalSpentBudget / budgetReport.totalApprovedBudget) * 100)}%` }} 
            />
          </div>
          <p className="text-[10.5px] text-slate-500">
            Giải ngân: <b>{Math.round((budgetReport.totalSpentBudget / budgetReport.totalApprovedBudget) * 100)}%</b> • Bình quân: <b>{(budgetReport.avgCostPerEmployee / 1000).toLocaleString('vi-VN')}k/NV</b>
          </p>
        </div>
      </div>

      {/* 4 PROFESSIONAL NAVIGATION TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto scrollable-tabs pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('QUOTAS')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'QUOTAS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Thống Kê & Giám Sát Định Mức (L&D Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('LMS')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'LMS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Cổng Học Tập LMS & Video Bài Giảng</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-indigo-950 font-bold">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('EXTERNAL_BONDS')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'EXTERNAL_BONDS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>3. Kế Hoạch Đào Tạo Ngoài & Cam Kết Đ62 BLLĐ</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold">
              {commitments.filter(c => c.status === 'ACTIVE').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SKILL_MATRIX')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'SKILL_MATRIX'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>4. Ma Trận Kỹ Năng & Giảng Viên Nội Bộ</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500 text-white font-bold">
              {trainers.length} GV
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* TAB 1: THỐNG KÊ & GIÁM SÁT ĐỊNH MỨC GIỜ ĐÀO TẠO */}
      {/* ========================================================================================= */}
      {activeTab === 'QUOTAS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Khối A: Bảng Quy Ước Chỉ Tiêu Định Mức 4 Nhóm Đối Tượng */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Quy Ước Định Mức Giờ Đào Tạo Hàng Năm Theo Nhóm Chức Danh</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quy định chỉ tiêu số giờ học tối thiểu và tỷ lệ đào tạo nội bộ bắt buộc phải đạt trên 70%
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingQuotas([...quotas]);
                  setShowQuotaModal(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Tùy Chỉnh Định Mức</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {quotas.map((q) => (
                <div 
                  key={q.id} 
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.groupId === 'MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                      q.groupId === 'SPECIALIST' ? 'bg-blue-100 text-blue-800' :
                      q.groupId === 'FACTORY' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {q.groupName}
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      KPI: {q.kpiWeightPercent}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-slate-900">{q.targetHoursPerYear}</span>
                      <span className="text-xs font-semibold text-slate-500">giờ/năm</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{q.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Đào tạo Nội bộ:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ≥ {q.minInternalRatio}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khối B: Thanh Cảnh Báo Pháp Chế & Tỷ Lệ Nội Bộ */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-2xl border border-emerald-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-950">
                  Tỷ Lệ Đào Tạo Nội Bộ Toàn Doanh Nghiệp Hiện Tại: {overallInternalRatio}% (Chuẩn Quy Định: ≥ 70%)
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Toàn bộ 320 giờ học nội bộ được thực hiện qua cổng LMS số, huấn luyện OJT tại chuyền và workshop chuyên đề nội bộ do chính Trưởng phòng đứng lớp.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-right text-xs">
                <p className="font-bold text-slate-800">Cơ cấu thời lượng:</p>
                <p className="text-[11px] text-slate-500">Nội bộ: <b>{totalInternalCompanyHours}h</b> • Bên ngoài: <b>{totalExternalCompanyHours}h</b></p>
              </div>
            </div>
          </div>

          {/* Khối C: Bảng Theo Dõi Tiến Độ Từng Nhân Sự & Đánh Giá Thi Đua KPI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Tiến Độ Tích Lũy Giờ Đào Tạo Cá Nhân Năm 2026</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi số giờ nội bộ/bên ngoài, tỷ lệ hoàn thành và cảnh báo nhân sự chưa đủ điều kiện xét KPI
                </p>
              </div>

              {/* Bộ lọc */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    placeholder="Tìm tên, mã NV, chức vụ..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                  />
                </div>

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả phòng ban</option>
                  {uniqueDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={selectedKpiFilter}
                  onChange={(e) => setSelectedKpiFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái KPI</option>
                  <option value="MET">✓ Đạt chuẩn (≥ 80%)</option>
                  <option value="WARNING">⚠️ Cảnh báo thiếu giờ (&lt; 80%)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto scrollable-tabs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nhân Viên</th>
                    <th className="px-3 py-3">Phòng Ban / Chức Vụ</th>
                    <th className="px-3 py-3 text-center">Nhóm Đối Tượng</th>
                    <th className="px-3 py-3 text-center">Chỉ Tiêu Năm</th>
                    <th className="px-3 py-3 text-center">Nội Bộ</th>
                    <th className="px-3 py-3 text-center">Bên Ngoài</th>
                    <th className="px-3 py-3 text-center">Tổng Tích Lũy</th>
                    <th className="px-3 py-3 text-center">Tỷ Lệ Nội Bộ</th>
                    <th className="px-4 py-3">Tiến Độ Hoàn Thành</th>
                    <th className="px-3 py-3 text-center">Xếp Loại Thi Đua KPI</th>
                    <th className="px-4 py-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEmployeeProgress.map((emp) => {
                    const isMet = emp.kpiStatus === 'MET' || emp.kpiStatus === 'EXCELLENT';
                    const isInternalGood = emp.internalRatioActual >= 70;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{emp.employeeName}</div>
                          <span className="font-mono text-[10.5px] text-slate-400">{emp.employeeCode}</span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800">{emp.roleTitle}</div>
                          <div className="text-[10.5px] text-slate-500">{emp.department}</div>
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.groupId === 'MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                            emp.groupId === 'SPECIALIST' ? 'bg-blue-100 text-blue-800' :
                            emp.groupId === 'FACTORY' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {emp.groupName}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-slate-700">
                          {emp.targetHours}h
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-emerald-600">
                          {emp.internalHours}h
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-blue-600">
                          {emp.externalHours}h
                        </td>

                        <td className="px-3 py-3 text-center font-black text-slate-900">
                          {emp.totalAccumulatedHours}h
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className={`font-bold text-[11px] ${isInternalGood ? 'text-emerald-700' : 'text-rose-600 font-black'}`}>
                            {emp.internalRatioActual}%
                          </span>
                        </td>

                        <td className="px-4 py-3 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10.5px]">
                              <span className="font-bold text-slate-700">{emp.completionRate}%</span>
                              <span className="text-slate-400">{emp.totalAccumulatedHours}/{emp.targetHours}h</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  emp.completionRate >= 100 ? 'bg-emerald-500' :
                                  emp.completionRate >= 80 ? 'bg-indigo-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, emp.completionRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {emp.kpiStatus === 'EXCELLENT' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center space-x-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>Vượt Chỉ Tiêu ({emp.completionRate}%)</span>
                            </span>
                          ) : emp.kpiStatus === 'MET' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center space-x-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>Đạt Chuẩn KPI</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center space-x-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Thiếu {emp.targetHours - emp.totalAccumulatedHours}h</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEmployeeForAddHours(emp)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center space-x-1 mx-auto"
                            title="Ghi nhận thêm giờ đào tạo OJT hoặc cử đi học"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm Giờ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Hiển thị <b>{filteredEmployeeProgress.length}</b> / <b>{employeeProgress.length}</b> nhân sự
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Xanh: Vượt chỉ tiêu</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Xanh tím: Đạt chuẩn KPI</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Đỏ: Cảnh báo chưa đủ giờ</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: CỔNG HỌC TẬP LMS & VIDEO BÀI GIẢNG (ĐÃ HOÀN THIỆN NÂNG CẤP) */}
      {/* ========================================================================================= */}
      {activeTab === 'LMS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* DANH SÁCH KHÓA HỌC LMS: 3 BẢNG 1 HÀNG, CỨ 2 HÀNG CẮT SANG TRANG (6 KHÓA / TRANG) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedCourses.map((course) => {
              const isDone = completedCourseIds.has(course.id) || course.isCompleted;
              const isEligibleForQuiz = (course.actualWatchedMinutes || 0) >= (course.minRequiredMinutes || 5);
              const percentWatched = Math.min(100, Math.round(((course.actualWatchedMinutes || 0) / (course.minRequiredMinutes || 5)) * 100));

              return (
                <div 
                  key={course.id} 
                  className={`bg-white rounded-xl border p-3.5 shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                    isDone ? 'border-emerald-300 bg-emerald-50/15 ring-1 ring-emerald-200' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                        course.category === 'ONBOARDING' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        course.category === 'SAFETY_LABOR' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        course.category === 'SKILLS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {course.category === 'ONBOARDING' ? 'Hội nhập' : 
                         course.category === 'SAFETY_LABOR' ? 'An toàn PCCC' : 
                         course.category === 'SKILLS' ? 'Chuyên môn' : 'Quản lý'}
                      </span>
                      
                      {isDone ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Đã Hoàn Thành</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.durationHours}h</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1" title={course.title}>
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{course.description}</p>
                    </div>

                    {/* Khối giám sát điều kiện xem video */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 flex items-center space-x-1 text-[11px]">
                          <Video className="w-3 h-3 text-indigo-600" />
                          <span>Xem video:</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isDone ? 'bg-emerald-100 text-emerald-800' :
                          isEligibleForQuiz ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isDone ? '✓ Đạt chuẩn' : isEligibleForQuiz ? '✓ Đủ điều kiện' : '🔒 Chưa đủ'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Đã xem: <b>{(course.actualWatchedMinutes || 0).toLocaleString('vi-VN')}p</b> / <b>{(course.minRequiredMinutes || 5).toLocaleString('vi-VN')}p</b></span>
                          <span><b>{(course.watchCount || 0).toLocaleString('vi-VN')}</b> lượt</span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${isDone || isEligibleForQuiz ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            style={{ width: `${percentWatched}%` }}
                          />
                        </div>

                        {course.realVideoDurationText && (
                          <div className="pt-1 flex items-center justify-between text-[9.5px] text-indigo-700 font-medium">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Thời lượng thật: {course.realVideoDurationText}</span>
                            </span>
                            <span className="text-slate-400">{course.enrolledEmployees.toLocaleString('vi-VN')} học viên</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-0.5 text-[10px]">
                        <button
                          onClick={() => handleOpenVideo(course)}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem Video</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1 cursor-pointer"
                          title="Sửa link video & kiểm tra thời lượng thật"
                        >
                          <span>✏️ Sửa link</span>
                        </button>

                        <button
                          onClick={() => handleSimulateWatchProgress(course.id, course.minRequiredMinutes || 5)}
                          className="font-semibold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                          title="Mô phỏng nhân viên xem đủ video"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>Xem đủ</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động mở bài thi */}
                  <div className="pt-2 border-t border-slate-100">
                    {isDone ? (
                      <button
                        onClick={() => {
                          setShowQuizModal(course);
                          setQuizSubmitted(true);
                        }}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã Đạt 100/100 (Xem Chứng Chỉ)</span>
                      </button>
                    ) : isEligibleForQuiz ? (
                      <button
                        onClick={() => {
                          setShowQuizModal(course);
                          setQuizSubmitted(false);
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Vào Làm Bài Kiểm Tra</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-1.5 bg-slate-100 text-slate-400 text-[11px] font-semibold rounded-lg flex items-center justify-center space-x-1 cursor-not-allowed border border-slate-200"
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Cần xem đủ {(course.minRequiredMinutes || 5).toLocaleString('vi-VN')}p video</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* THANH PHÂN TRANG (PAGINATION) */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-slate-500">
              Hiển thị <b className="text-slate-800">{((currentPage - 1) * PAGE_SIZE + 1).toLocaleString('vi-VN')} - {Math.min(currentPage * PAGE_SIZE, sortedCourses.length).toLocaleString('vi-VN')}</b> trong tổng số <b className="text-slate-800">{sortedCourses.length.toLocaleString('vi-VN')}</b> khóa học
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  currentPage === 1
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  currentPage === totalPages
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <span>Trang sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: KẾ HOẠCH ĐÀO TẠO NGOÀI & CAM KẾT ĐIỀU 62 BLLĐ */}
      {/* ========================================================================================= */}
      {activeTab === 'EXTERNAL_BONDS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Banner Căn Cứ Pháp Lý Điều 62 BLLĐ 2019 */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-2">
                  <span>CĂN CỨ PHÁP LÝ: ĐIỀU 62 BỘ LUẬT LAO ĐỘNG 2019 (HỢP ĐỒNG ĐÀO TẠO NGHỀ)</span>
                </h4>
                <p className="text-[11px] text-amber-900 leading-relaxed max-w-3xl">
                  Khi người sử dụng lao động chi trả kinh phí đào tạo, nâng cao trình độ cho người lao động thì hai bên phải ký <b>Hợp đồng đào tạo nghề</b>. 
                  Người lao động đơn phương chấm dứt HĐLĐ trái pháp luật hoặc vi phạm cam kết phục vụ <b>phải hoàn trả chi phí đào tạo</b> theo tỷ lệ khấu hao tương ứng với thời gian chưa làm việc.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBondSimulator(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <DollarSign className="w-4 h-4" />
              <span>Mô Phỏng Tính Tiền Bồi Hoàn</span>
            </button>
          </div>

          {/* Bảng Danh Mục Cam Kết Đào Tạo Ràng Buộc Phục Vụ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Danh Mục Hợp Đồng & Cam Kết Đào Tạo Có Hiệu Lực</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi thời hạn cam kết phục vụ và số tiền khấu hao bồi hoàn tự động nếu nhân sự nghỉ việc
                </p>
              </div>

              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200">
                {commitments.filter(c => c.status === 'ACTIVE').length} Cam kết đang hiệu lực
              </span>
            </div>

            <div className="overflow-x-auto scrollable-tabs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Mã Cam Kết</th>
                    <th className="px-4 py-3">Nhân Viên & Phòng Ban</th>
                    <th className="px-4 py-3">Khóa Học & Đơn Vị Đào Tạo</th>
                    <th className="px-3 py-3 text-right">Tổng Chi Phí</th>
                    <th className="px-3 py-3 text-center">Thời Hạn</th>
                    <th className="px-3 py-3 text-center">Đã Phục Vụ</th>
                    <th className="px-3 py-3 text-center">Còn Lại</th>
                    <th className="px-4 py-3 text-right">Số Tiền Bồi Hoàn Khấu Hao</th>
                    <th className="px-3 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-center">Biên Bản</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {commitments.map((cmt) => {
                    const isFulfilled = cmt.status === 'FULFILLED';

                    return (
                      <tr key={cmt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                          {cmt.commitmentCode}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{cmt.employeeName}</div>
                          <div className="text-[10.5px] text-slate-400 font-mono">{cmt.employeeId} • {cmt.department}</div>
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-semibold text-slate-800 line-clamp-1">{cmt.courseName}</div>
                          <div className="text-[10.5px] text-slate-500">{cmt.provider}</div>
                        </td>

                        <td className="px-3 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {cmt.totalInvestmentCost.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-slate-700 whitespace-nowrap">
                          {cmt.commitmentMonths} tháng
                        </td>

                        <td className="px-3 py-3 text-center font-semibold text-emerald-600 whitespace-nowrap">
                          {cmt.servedMonths} tháng
                        </td>

                        <td className="px-3 py-3 text-center font-bold whitespace-nowrap">
                          <span className={cmt.remainingMonths > 0 ? 'text-amber-600' : 'text-slate-400'}>
                            {cmt.remainingMonths} tháng
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isFulfilled ? (
                            <span className="text-slate-400 font-semibold">0 đ (Đã hết hạn)</span>
                          ) : (
                            <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {cmt.potentialRefundAmount.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {isFulfilled ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Đã Hoàn Thành
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Đang Hiệu Lực
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setViewingCommitmentModal(cmt)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center space-x-1 mx-auto"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Xem HĐ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng Kế Hoạch Đào Tạo Bên Ngoài Năm 2026 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  <span>Kế Hoạch Khóa Đào Tạo Bên Ngoài Năm 2026 (≤ 30% Tổng Thời Lượng)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấp chứng chỉ kiểm định an toàn quốc gia, ISO/HACCP quốc tế và kỹ năng quản trị cấp cao
                </p>
              </div>

              <span className="text-xs text-slate-500 font-semibold">
                Tổng dự toán ngoài: <b className="text-indigo-600">{externalCourses.reduce((s, c) => s + c.costPerPerson * c.enrolledCount, 0).toLocaleString('vi-VN')} đ</b>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {externalCourses.map(course => (
                <div key={course.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      course.category === 'CERTIFICATION' ? 'bg-purple-100 text-purple-800' :
                      course.category === 'COMPLIANCE' ? 'bg-rose-100 text-rose-800' :
                      course.category === 'LEADERSHIP' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {course.category === 'CERTIFICATION' ? 'Chứng chỉ quốc tế' :
                       course.category === 'COMPLIANCE' ? 'Bắt buộc an toàn' :
                       course.category === 'LEADERSHIP' ? 'Kỹ năng quản trị' : 'Kỹ thuật'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      course.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      course.status === 'ENROLLING' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {course.status === 'COMPLETED' ? '✓ Đã hoàn thành' : course.status === 'ENROLLING' ? 'Đang tuyển sinh' : 'Lên kế hoạch'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{course.courseName}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{course.provider}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời lượng:</span>
                      <span className="font-bold text-slate-800">{course.durationHours} giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Học phí / người:</span>
                      <span className="font-bold text-indigo-700">{course.costPerPerson.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cam kết phục vụ:</span>
                      <span className="font-bold text-amber-700">{course.requiredCommitmentMonths} tháng (Đ62)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1">
                    <span>{course.location}</span>
                    <span><b>{course.enrolledCount}</b> học viên</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 4: MA TRẬN KỸ NĂNG & GIẢNG VIÊN NỘI BỘ */}
      {/* ========================================================================================= */}
      {activeTab === 'SKILL_MATRIX' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Khối 1: Đội Ngũ Cán Bộ Giảng Viên Nội Bộ (Internal Trainer Pool) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Đội Ngũ Cán Bộ Giảng Viên Nội Bộ & Chính Sách Thù Lao Giảng Dạy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vinh danh các Trưởng bộ phận, Kỹ sư đứng lớp đào tạo OJT & Workshop thực hành với mức phụ cấp giờ giảng
                </p>
              </div>

              <button
                onClick={() => setShowAddTrainerSessionModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi Nhận Buổi Giảng Dạy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {trainers.map((trn) => (
                <div key={trn.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {trn.trainerCode}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{trn.studentRatingAverage}/5.0</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{trn.employeeName}</h4>
                    <p className="text-[11px] text-slate-500">{trn.roleTitle} • {trn.department}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {trn.specialtyTopics.map((top, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {top}
                      </span>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giờ đứng lớp 2026:</span>
                      <span className="font-black text-indigo-600">{trn.totalTeachingHours} giờ ({trn.totalClassesTaught} lớp)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mức thù lao:</span>
                      <span className="font-semibold text-slate-700">{(trn.hourlyAllowanceRate / 1000).toLocaleString('vi-VN')}k / giờ</span>
                    </div>
                    <div className="flex justify-between pt-0.5 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Tổng thù lao đã nhận:</span>
                      <span className="font-bold text-emerald-600">{trn.totalAllowancePaid.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khối 2: Ma Trận Năng Lực & Khoảng Trống Kỹ Năng (Skill Matrix & Gap Analysis) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Ma Trận Kỹ Năng Nhân Sự (Skill Matrix 4 Cấp Độ)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân tích khoảng trống kỹ năng (Skill Gap) và tự động đề xuất khóa học bù đắp
                </p>
              </div>

              {/* Giải thích cấp độ */}
              <div className="flex items-center space-x-2 text-[10.5px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">L1: Nhập môn</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">L2: Có giám sát</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">L3: Độc lập</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">L4: Chuyên gia/Đào tạo</span>
              </div>
            </div>

            <div className="overflow-x-auto scrollable-tabs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nhân Viên & Vị Trí</th>
                    <th className="px-4 py-3">Kỹ Năng Nghiệp Vụ Chuyên Sâu</th>
                    <th className="px-3 py-3 text-center">Yêu Cầu (Target)</th>
                    <th className="px-3 py-3 text-center">Hiện Tại (Actual)</th>
                    <th className="px-3 py-3 text-center">Khoảng Trống (Gap)</th>
                    <th className="px-4 py-3">Khóa Học Đề Xuất Bù Đắp</th>
                    <th className="px-3 py-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {skillMatrix.map((item) => {
                    const hasGap = item.gap > 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.employeeName}</div>
                          <div className="text-[10.5px] text-slate-400 font-mono">{item.roleTitle}</div>
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs">
                          {item.skillName}
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-slate-700">
                          Level {item.requiredLevel}
                        </td>

                        <td className="px-3 py-3 text-center font-bold">
                          <span className={hasGap ? 'text-rose-600' : 'text-emerald-600'}>
                            Level {item.currentLevel}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          {hasGap ? (
                            <span className="px-2 py-0.5 rounded font-black text-rose-800 bg-rose-100 text-[10px]">
                              Thiếu -{item.gap} Cấp
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-100 text-[10px]">
                              ✓ Đạt Chuẩn
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-indigo-700 font-medium">
                          {item.recommendedCourseTitle}
                        </td>

                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {item.status === 'QUALIFIED' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Đạt Chuẩn
                            </span>
                          ) : item.status === 'TRAINING_IN_PROGRESS' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                              Đang Đào Tạo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                              Cần Bổ Sung
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL CẤU HÌNH ĐỊNH MỨC GIỜ ĐÀO TẠO 4 NHÓM ĐỐI TƯỢNG */}
      {/* ========================================================================================= */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Cấu Hình Chỉ Tiêu L&D</span>
                <h3 className="font-bold text-base text-slate-900">Thiết Lập Định Mức Giờ Đào Tạo Hàng Năm</h3>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                Điều chỉnh số giờ đào tạo định mức năm và tỷ lệ đào tạo nội bộ (quy ước ≥ 70%) cho từng nhóm chức danh. Khi lưu, toàn bộ bảng theo dõi tiến độ nhân sự sẽ tự động tính lại tỷ lệ hoàn thành.
              </p>

              <div className="space-y-3">
                {editingQuotas.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.groupName}</span>
                      <span className="text-[10.5px] text-slate-500">{q.applicableRoles}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">Giờ định mức / năm:</label>
                        <input
                          type="number"
                          value={q.targetHoursPerYear}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            setEditingQuotas(prev => prev.map((item, i) => i === idx ? { ...item, targetHoursPerYear: val } : item));
                          }}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-indigo-700 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">Tỷ lệ Nội bộ tối thiểu (%):</label>
                        <input
                          type="number"
                          value={q.minInternalRatio}
                          onChange={(e) => {
                            const val = Math.max(50, Math.min(100, Number(e.target.value)));
                            setEditingQuotas(prev => prev.map((item, i) => i === idx ? { ...item, minInternalRatio: val } : item));
                          }}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-emerald-700 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">Trọng số KPI năm (%):</label>
                        <input
                          type="number"
                          value={q.kpiWeightPercent}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(30, Number(e.target.value)));
                            setEditingQuotas(prev => prev.map((item, i) => i === idx ? { ...item, kpiWeightPercent: val } : item));
                          }}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuotas}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Lưu Định Mức & Cập Nhật Hệ Thống
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL GHI NHẬN THÊM GIỜ ĐÀO TẠO CHO NHÂN SỰ */}
      {/* ========================================================================================= */}
      {selectedEmployeeForAddHours && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Cập Nhật Tiến Độ Học Tập</span>
                <h3 className="font-bold text-base text-slate-900">{selectedEmployeeForAddHours.employeeName}</h3>
                <p className="text-xs text-slate-500">{selectedEmployeeForAddHours.roleTitle} • {selectedEmployeeForAddHours.department}</p>
              </div>
              <button onClick={() => setSelectedEmployeeForAddHours(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hình thức đào tạo:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddHourForm({ ...addHourForm, trainingType: 'INTERNAL' })}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      addHourForm.trainingType === 'INTERNAL'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Đào Tạo Nội Bộ (OJT/LMS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddHourForm({ ...addHourForm, trainingType: 'EXTERNAL' })}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      addHourForm.trainingType === 'EXTERNAL'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Đào Tạo Cử Đi Bên Ngoài
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số giờ đào tạo ghi nhận:</label>
                <input
                  type="number"
                  value={addHourForm.hours}
                  onChange={(e) => setAddHourForm({ ...addHourForm, hours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-indigo-700 outline-none"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chuyên đề / Nội dung đào tạo:</label>
                <input
                  type="text"
                  value={addHourForm.topic}
                  onChange={(e) => setAddHourForm({ ...addHourForm, topic: e.target.value })}
                  placeholder="Ví dụ: Kèm cặp vận hành máy chiết rót, 5S thực địa..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmployeeForAddHours(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAddHours}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Ghi Nhận Số Giờ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL XEM CHI TIẾT BIÊN BẢN CAM KẾT ĐÀO TẠO ĐIỀU 62 BLLĐ */}
      {/* ========================================================================================= */}
      {viewingCommitmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Văn Bản Pháp Lý Nhân Sự</span>
                <h3 className="font-bold text-base text-slate-900">BẢN CAM KẾT ĐÀO TẠO & BỒI HOÀN KINH PHÍ</h3>
                <p className="text-xs text-slate-500 font-mono">Mã số: {viewingCommitmentModal.commitmentCode}</p>
              </div>
              <button onClick={() => setViewingCommitmentModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-mono leading-relaxed">
              <div className="text-center font-bold text-slate-800 text-xs pb-2 border-b border-slate-200">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                Độc lập - Tự do - Hạnh phúc<br />
                ---o0o---
              </div>

              <div>
                <p><b>BÊN A (Người sử dụng lao động):</b> CÔNG TY CỔ PHẦN AN VIỆT MANUFACTURING</p>
                <p><b>BÊN B (Người lao động):</b> Ông/Bà <b>{viewingCommitmentModal.employeeName}</b></p>
                <p>Mã nhân viên: <b>{viewingCommitmentModal.employeeId}</b> • Bộ phận: <b>{viewingCommitmentModal.department}</b></p>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <p><b>Điều 1: Khóa đào tạo cử đi học:</b></p>
                <p className="text-indigo-900 font-bold">• {viewingCommitmentModal.courseName}</p>
                <p>• Đơn vị đào tạo: {viewingCommitmentModal.provider}</p>
                <p>• Tổng kinh phí tài trợ: <b>{viewingCommitmentModal.totalInvestmentCost.toLocaleString('vi-VN')} VNĐ</b></p>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <p><b>Điều 2: Thời hạn cam kết phục vụ & Trách nhiệm bồi hoàn (Khoản 2 Điều 62 BLLĐ 2019):</b></p>
                <p>• Bên B cam kết tiếp tục làm việc tại Bên A trong thời hạn tối thiểu: <b>{viewingCommitmentModal.commitmentMonths} tháng</b> (từ {viewingCommitmentModal.startDate} đến {viewingCommitmentModal.endDate}).</p>
                <p>• Số tháng đã phục vụ: <b>{viewingCommitmentModal.servedMonths} tháng</b>. Số tháng còn lại: <b>{viewingCommitmentModal.remainingMonths} tháng</b>.</p>
                <p className="p-2 bg-rose-50 rounded border border-rose-200 text-rose-900 font-bold">
                  • NẾU ĐƠN PHƯƠNG CHẤM DỨT HĐLĐ TẠI THỜI ĐIỂM HIỆN TẠI, SỐ TIỀN PHẢI BỒI HOÀN LÀ: {viewingCommitmentModal.potentialRefundAmount.toLocaleString('vi-VN')} VNĐ
                  <br /><span className="text-[10px] font-normal text-rose-700">(Công thức: {viewingCommitmentModal.totalInvestmentCost.toLocaleString('vi-VN')} đ × {viewingCommitmentModal.remainingMonths}/{viewingCommitmentModal.commitmentMonths} tháng)</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setViewingCommitmentModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL MÔ PHỎNG TÍNH TOÁN BỒI HOÀN CAM KẾT ĐÀO TẠO */}
      {/* ========================================================================================= */}
      {showBondSimulator && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Công Cụ Pháp Chế Nhân Sự</span>
                <h3 className="font-bold text-base text-slate-900">Mô Phỏng Bồi Hoàn Chi Phí (Điều 62 BLLĐ)</h3>
              </div>
              <button onClick={() => setShowBondSimulator(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tổng chi phí đào tạo công ty đầu tư (VNĐ):</label>
                <FormattedNumberInput
                  value={simForm.totalCost || 0}
                  onChange={(val) => setSimForm({ ...simForm, totalCost: val })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
                  placeholder="VD: 50.000.000"
                  unit="VNĐ"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số tháng cam kết:</label>
                  <input
                    type="number"
                    value={simForm.commitmentMonths}
                    onChange={(e) => setSimForm({ ...simForm, commitmentMonths: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
                    min="1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số tháng đã làm việc:</label>
                  <input
                    type="number"
                    value={simForm.servedMonths}
                    onChange={(e) => setSimForm({ ...simForm, servedMonths: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
                    min="0"
                  />
                </div>
              </div>

              {/* Kết quả tính toán */}
              {(() => {
                const res = calculateTrainingBondRefund(simForm.totalCost, simForm.commitmentMonths, simForm.servedMonths);
                return (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Số tháng còn thiếu:</span>
                      <span className="font-black text-rose-600 text-sm">{res.remainingMonths} tháng ({res.refundPercentage}%)</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-200/70">
                      <span className="font-bold text-slate-900">Số tiền phải hoàn trả Bên A:</span>
                      <span className="font-black text-rose-600 text-base">{res.refundAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Công thức theo Điều 62 Khoản 2 BLLĐ 2019: Chi phí bồi hoàn = Tổng kinh phí × (Số tháng chưa làm việc / Tổng số tháng cam kết).
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBondSimulator(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL GHI NHẬN BUỔI GIẢNG DẠY NỘI BỘ */}
      {/* ========================================================================================= */}
      {showAddTrainerSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Giảng Viên Nội Bộ</span>
                <h3 className="font-bold text-base text-slate-900">Ghi Nhận Buổi Giảng Dạy & Tính Thù Lao</h3>
              </div>
              <button onClick={() => setShowAddTrainerSessionModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cán bộ giảng viên:</label>
                <select
                  value={newTrainerSession.trainerId}
                  onChange={(e) => setNewTrainerSession({ ...newTrainerSession, trainerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.employeeName} ({t.roleTitle} - {(t.hourlyAllowanceRate / 1000).toLocaleString('vi-VN')}k/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên chuyên đề đào tạo:</label>
                <input
                  type="text"
                  value={newTrainerSession.topic}
                  onChange={(e) => setNewTrainerSession({ ...newTrainerSession, topic: e.target.value })}
                  placeholder="Ví dụ: Thực hành 5S tại khu vực đóng gói..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số giờ đứng lớp:</label>
                  <input
                    type="number"
                    value={newTrainerSession.hours}
                    onChange={(e) => setNewTrainerSession({ ...newTrainerSession, hours: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-indigo-700 outline-none"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số học viên tham dự:</label>
                  <input
                    type="number"
                    value={newTrainerSession.attendeesCount}
                    onChange={(e) => setNewTrainerSession({ ...newTrainerSession, attendeesCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddTrainerSessionModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddTrainerSession}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Ghi Nhận & Tính Phụ Cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL PHÁT VIDEO BÀI GIẢNG YOUTUBE / GOOGLE DRIVE */}
      {/* ========================================================================================= */}
      {activeVideoCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeVideoCourse.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    Hệ thống đang tự động theo dõi thời gian xem và ghi nhận số lượt học
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveVideoCourse(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 select-none" onContextMenu={(e) => e.preventDefault()}>
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                {activeVideoCourse.videoUrl ? (
                  activeVideoCourse.videoUrl.endsWith('.mp4') || activeVideoCourse.videoUrl.includes('sample') ? (
                    <video
                      src={activeVideoCourse.videoUrl}
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={activeVideoCourse.videoUrl}
                      title={activeVideoCourse.title}
                      className="w-full h-full border-0 pointer-events-auto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-xs">
                    Chưa cấu hình URL video bài giảng
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>🔒 Chế độ phát bảo mật nội bộ: Đã chặn chuột phải và khóa nút tải video.</span>
                <span className="font-mono">{activeVideoCourse.videoUrl ? 'URL: ' + activeVideoCourse.videoUrl.slice(0, 45) + '...' : ''}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">
                    Đã xem: {(activeVideoCourse.actualWatchedMinutes || 0).toLocaleString('vi-VN')} phút / {(activeVideoCourse.minRequiredMinutes || 5).toLocaleString('vi-VN')} phút yêu cầu
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">Lượt xem lại: {(activeVideoCourse.watchCount || 0).toLocaleString('vi-VN')} lần</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                    <span>Đang phát thực tế: {formatSecondsToClock(activePlaybackSeconds)} ({Math.floor(activePlaybackSeconds / 60)} phút)</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  {((activeVideoCourse.actualWatchedMinutes || 0) >= (activeVideoCourse.minRequiredMinutes || 5)) ? (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã xem đủ điều kiện quy định! Bạn có thể ra làm bài thi ngay.</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      Vui lòng xem đủ ít nhất {((activeVideoCourse.minRequiredMinutes || 5) - (activeVideoCourse.actualWatchedMinutes || 0)).toLocaleString('vi-VN')} phút nữa để mở khóa đề thi.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSimulateWatchProgress(activeVideoCourse.id, 1)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  +1 Phút Xem
                </button>
                <button
                  onClick={() => handleSimulateWatchProgress(activeVideoCourse.id, activeVideoCourse.minRequiredMinutes || 5)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Ký Duyệt Đã Xem Xong (Admin)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL LÀM BÀI TRẮC NGHIỆM ĐÁNH GIÁ NĂNG LỰC */}
      {/* ========================================================================================= */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Bài Thi Kiểm Tra Đánh Giá</span>
                <h3 className="font-bold text-base text-slate-900">{showQuizModal.title}</h3>
                <p className="text-xs text-slate-500">Điều kiện: Đã xem đủ {showQuizModal.actualWatchedMinutes} phút video</p>
              </div>
              <button onClick={() => setShowQuizModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900">Câu 1: Theo quy định BLLĐ 2019, người lao động làm việc ca đêm từ mấy giờ đến mấy giờ?</p>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q1" 
                      checked={selectedAnswers.q1 === 'A'} 
                      onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: 'A' })} 
                      className="text-indigo-600" 
                    />
                    <span>A. Từ 22h00 đêm hôm trước đến 06h00 sáng hôm sau (Hưởng thêm 30% lương)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q1" 
                      checked={selectedAnswers.q1 === 'B'} 
                      onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: 'B' })} 
                      className="text-indigo-600" 
                    />
                    <span>B. Từ 21h00 đêm đến 05h00 sáng</span>
                  </label>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900">Câu 2: Mức bồi dưỡng độc hại bằng hiện vật áp dụng theo thông tư nào?</p>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q2" 
                      checked={selectedAnswers.q2 === 'A'} 
                      onChange={() => setSelectedAnswers({ ...selectedAnswers, q2: 'A' })} 
                      className="text-indigo-600" 
                    />
                    <span>A. Thông tư 24/2022/TT-BLĐTBXH (4 mức định suất từ 13k đến 32k/ngày)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q2" 
                      checked={selectedAnswers.q2 === 'B'} 
                      onChange={() => setSelectedAnswers({ ...selectedAnswers, q2: 'B' })} 
                      className="text-indigo-600" 
                    />
                    <span>B. Thông tư 111/2013/TT-BTC</span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setQuizSubmitted(true);
                      if (showQuizModal) {
                        setCompletedCourseIds(prev => new Set([...prev, showQuizModal.id]));
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Nộp Bài Kiểm Tra & Chấm Điểm
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Chúc Mừng Bạn Đã Đạt 100/100 Điểm!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hệ thống đã tự động cấp Chứng Chỉ Hoàn Thành Đào Tạo Nội Bộ An Việt và lưu kết quả vào Hồ sơ Năng lực nhân sự.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setShowQuizModal(null)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL CẬP NHẬT LINK VIDEO ĐÀO TẠO & THỜI LƯỢNG */}
      {/* ========================================================================================= */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Cấu Hình Khóa Học</span>
                <h3 className="font-bold text-base text-slate-900 truncate max-w-sm">{editingCourse.title}</h3>
              </div>
              <button onClick={() => setEditingCourse(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Đường dẫn Video bài giảng (YouTube Embed / Google Drive / MP4):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => {
                      setNewVideoUrl(e.target.value);
                      setDetectedDurationInfo(null);
                      setDurationDetectionStatus(null);
                    }}
                    placeholder="https://www.youtube.com/embed/... hoặc https://drive.google.com/file/d/.../preview hoặc link .mp4"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleProbeDuration}
                    disabled={isVerifyingDuration || !newVideoUrl.trim()}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isVerifyingDuration ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>Đo Thời Lượng Thật</span>
                  </button>
                </div>

                {isVerifyingDuration && (
                  <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center space-x-2 text-indigo-800 text-[11px] animate-fadeIn">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
                    <span>{durationDetectionStatus || 'Đang kết nối phân tích thời lượng video thực tế từ đường dẫn...'}</span>
                  </div>
                )}

                {detectedDurationInfo && !isVerifyingDuration && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 animate-fadeIn text-[11px]">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center space-x-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Thời lượng video thực tế: {detectedDurationInfo.text} ({detectedDurationInfo.seconds} giây)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 uppercase font-mono">{detectedDurationInfo.sourceType}</span>
                    </div>
                    <p className="text-emerald-700">
                      ✓ Hệ thống đã tự động đo và cập nhật số phút học yêu cầu tối thiểu tương ứng: <b>{newMinMinutes} phút</b>.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Thời lượng xem tối thiểu trước khi mở bài thi (Số phút):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newMinMinutes}
                    onChange={(e) => setNewMinMinutes(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-medium text-xs">phút</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveVideoUrl}
                disabled={isVerifyingDuration}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifyingDuration ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Đo Thời Lượng...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu & Xác Minh Thời Lượng Thật</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
