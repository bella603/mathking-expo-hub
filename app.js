// ==================== CONFIG ====================
  const CONFIG = {
      EXPERIENCE_URL: "https://class.iammathking.com/learning-status/student/U3
  R1ZGVudDoxNzUxMTU5/overview",
      APPLY_URL_BASE: "https://hi.iammathking.com/coex2509",
      GUIDE_URL: "여기에_노션_가이드_URL",
      UTM: "utm_source=expo&utm_medium=hub&utm_campaign=coex2508"
  };

  // ==================== UTILS ====================
  function appendUtm(url, utm) {
      if (url.includes('?')) {
          return url + '&' + utm;
      } else {
          return url + '?' + utm;
      }
  }

  function openExternalLink(url) {
      try {
          const finalUrl = appendUtm(url, CONFIG.UTM);
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
          console.error('링크 열기 실패:', error);
          alert('페이지를 여는 중 오류가 발생했습니다. 잠시 후 다시 
  시도해주세요.');
      }
  }

  // ==================== TUTORIAL WIZARD ====================
  const TUTORIAL_STEPS = [
      {
          id: 'step1',
          title: '1단계: 접속/로그인',
          description: '아래 버튼으로 실제 화면을 새 탭에서 열고 관리자/교사 
  계정으로 로그인하세요.',
          hasButton: true,
          buttonText: '체험하기 바로가기',
          buttonAction: () => openExternalLink(CONFIG.EXPERIENCE_URL),
          checkboxText: '로그인 완료'
      },
      {
          id: 'step2',
          title: '2단계: 맞춤형 학습지 제작',
          description: '아래 영상을 시청하고 AI가 자동으로 학습지를 생성하는 
  과정을 확인하세요.',
          hasButton: true,
          buttonText: '시연 영상 보기',
          buttonAction: () => showTutorialVideo(),
          checkboxText: '영상 시청 완료',
          hasVideo: true,
          videoUrl: '/static/mathking_expo/맞춤 학습지 제작.mp4'
      },
      {
          id: 'step3',
          title: '3단계: 공유/배포 (선택)',
          description: '공유 버튼으로 링크/코드 전달',
          hasButton: false,
          checkboxText: '공유 기능 체험 완료'
      },
      {
          id: 'step4',
          title: '4단계: 기록 열람/관리',
          description: '리스트 → 필터/검색 → 상세 보기 → 상태 변경',
          hasButton: false,
          checkboxText: '관리 기능 체험 완료'
      },
      {
          id: 'step5',
          title: '5단계: 마무리',
          description: '끝났다면 체험계정 신청으로 이동해 주세요.',
          hasButton: true,
          buttonText: '체험계정 신청',
          buttonAction: () => window.location.href = './apply.html',
          checkboxText: '튜토리얼 완료'
      }
  ];

  class TutorialWizard {
      constructor() {
          this.currentStep = 0;
          this.completedSteps = this.loadProgress();
          this.isVisible = false;
          this.inactivityTimer = null;
          this.init();
      }

      init() {
          this.createTutorialHTML();
          this.bindEvents();
          this.startInactivityTimer();
      }

      loadProgress() {
          try {
              const saved = localStorage.getItem('mathking-tutorial-progress');
              return saved ? JSON.parse(saved) : {};
          } catch (error) {
              console.error('진행상황 로드 실패:', error);
              return {};
          }
      }

      saveProgress() {
          try {
              localStorage.setItem('mathking-tutorial-progress',
  JSON.stringify(this.completedSteps));
          } catch (error) {
              console.error('진행상황 저장 실패:', error);
          }
      }

      resetProgress() {
          this.completedSteps = {};
          this.currentStep = 0;
          this.saveProgress();
          this.render();
      }

      createTutorialHTML() {
          const tutorialHTML = `
              <div id="tutorialModal" class="tutorial-modal">
                  <div class="tutorial-content">
                      <div class="tutorial-header">
                          <h2>📚 단계별 따라하기</h2>
                          <button class="close-btn" 
  onclick="tutorial.hide()">&times;</button>
                      </div>
                      
                      <div class="progress-bar">
                          <div class="progress-fill" id="progressFill"></div>
                          <div class="progress-text" id="progressText">0 / 
  ${TUTORIAL_STEPS.length}</div>
                      </div>
                      
                      <div class="tutorial-body" id="tutorialBody">
                          <!-- Steps will be rendered here -->
                      </div>
                      
                      <div class="tutorial-footer">
                          <button class="btn-nav" id="prevBtn" 
  onclick="tutorial.prevStep()">← 이전</button>
                          <button class="btn-reset" 
  onclick="tutorial.resetProgress()">초기화</button>
                          <button class="btn-nav" id="nextBtn" 
  onclick="tutorial.nextStep()">다음 →</button>
                      </div>
                  </div>
              </div>
          `;

          document.body.insertAdjacentHTML('beforeend', tutorialHTML);
          this.render();
      }

      render() {
          this.updateProgress();
          this.renderCurrentStep();
          this.updateNavigation();
      }

      updateProgress() {
          const completed = Object.keys(this.completedSteps).length;
          const total = TUTORIAL_STEPS.length;
          const percentage = (completed / total) * 100;

          document.getElementById('progressFill').style.width =
  `${percentage}%`;
          document.getElementById('progressText').textContent = `${completed} /
   ${total}`;
      }

      renderCurrentStep() {
          const step = TUTORIAL_STEPS[this.currentStep];
          const isCompleted = this.completedSteps[step.id];

          const stepHTML = `
              <div class="step-card ${isCompleted ? 'completed' : ''}">
                  <div class="step-header">
                      <h3>${step.title}</h3>
                      <div class="step-checkbox">
                          <input type="checkbox" id="${step.id}" ${isCompleted 
  ? 'checked' : ''} 
                                 onchange="tutorial.toggleStep('${step.id}')">
                          <label for="${step.id}">${step.checkboxText}</label>
                      </div>
                  </div>
                  
                  <div class="step-description">
                      <p>${step.description}</p>
                  </div>
                  
                  ${step.hasButton ? `
                      <div class="step-action">
                          <button class="btn-action" 
  onclick="tutorial.executeStepAction(${this.currentStep})">
                              ${step.buttonText}
                          </button>
                      </div>
                  ` : ''}
                  
                  <div class="step-placeholder">
                      ${step.hasVideo ? `
                          <div class="video-container" style="display: none;" 
  id="video-container-${step.id}">
                              <div class="video-placeholder">
                                  <h3>📹 시연 영상</h3>
                                  <p>영상 파일이 준비 중입니다</p>
                                  <p style="color: #835EEB; font-size: 
  0.9rem;">현장에서 직접 시연을 확인해주세요</p>
                              </div>
                          </div>
                      ` : ''}
                      <div class="placeholder-img ${step.hasVideo ? 
  'with-video' : ''}">
                          ${step.hasVideo ? '📹 시연 영상' : '🖼️ 스크린샷 
  자리'}
                      </div>
                  </div>
              </div>
          `;

          document.getElementById('tutorialBody').innerHTML = stepHTML;
      }

      updateNavigation() {
          const prevBtn = document.getElementById('prevBtn');
          const nextBtn = document.getElementById('nextBtn');

          prevBtn.disabled = this.currentStep === 0;
          nextBtn.disabled = this.currentStep === TUTORIAL_STEPS.length - 1;

          prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
          nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
      }

      toggleStep(stepId) {
          const checkbox = document.getElementById(stepId);
          if (checkbox.checked) {
              this.completedSteps[stepId] = true;
          } else {
              delete this.completedSteps[stepId];
          }

          this.saveProgress();
          this.updateProgress();

          const stepCard = document.querySelector('.step-card');
          if (checkbox.checked) {
              stepCard.classList.add('completed');
          } else {
              stepCard.classList.remove('completed');
          }
      }

      executeStepAction(stepIndex) {
          const step = TUTORIAL_STEPS[stepIndex];
          if (step.buttonAction) {
              step.buttonAction();
          }
      }

      prevStep() {
          if (this.currentStep > 0) {
              this.currentStep--;
              this.render();
          }
      }

      nextStep() {
          if (this.currentStep < TUTORIAL_STEPS.length - 1) {
              this.currentStep++;
              this.render();
          }
      }

      show() {
          this.isVisible = true;
          document.getElementById('tutorialModal').classList.add('active');
          this.resetInactivityTimer();
      }

      hide() {
          this.isVisible = false;
          document.getElementById('tutorialModal').classList.remove('active');
          this.resetInactivityTimer();
      }

      // ==================== INACTIVITY TIMER ====================
      startInactivityTimer() {
          this.resetInactivityTimer();
      }

      resetInactivityTimer() {
          if (this.inactivityTimer) {
              clearTimeout(this.inactivityTimer);
          }

          this.inactivityTimer = setTimeout(() => {
              if (!this.isVisible) {
                  this.resetToDefault();
              }
          }, 90000); // 90초
      }

      resetToDefault() {
          // 메인 화면으로 돌아가기
          if (window.location.pathname !== '/index.html' &&
  !window.location.pathname.endsWith('index.html')) {
              window.location.href = './index.html';
          }

          // 튜토리얼 닫기
          this.hide();

          // 스크롤을 맨 위로
          window.scrollTo({ top: 0, behavior: 'smooth' });

          console.log('비활성 시간 초과 - 기본 화면으로 리셋');
      }
  }

  // ==================== STAFF CALL OVERLAY ====================
  class StaffCall {
      constructor() {
          this.createOverlayHTML();
          this.bindEvents();
      }

      createOverlayHTML() {
          const overlayHTML = `
              <div id="staffOverlay" class="staff-overlay">
                  <div class="staff-content">
                      <h2>🙋‍♂️ 스태프 호출</h2>
                      <p>손을 들어주세요!<br>담당자가 곧 찾아뵙겠습니다.</p>
                      <div class="staff-animation">
                          <div class="wave"></div>
                          <div class="wave"></div>
                          <div class="wave"></div>
                      </div>
                      <button class="btn-close" 
  onclick="staffCall.hide()">닫기</button>
                  </div>
              </div>
          `;

          document.body.insertAdjacentHTML('beforeend', overlayHTML);
      }

      bindEvents() {
          document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                  this.hide();
              }
          });
      }

      show() {
          document.getElementById('staffOverlay').classList.add('active');
          tutorial.resetInactivityTimer();
      }

      hide() {
          document.getElementById('staffOverlay').classList.remove('active');
          tutorial.resetInactivityTimer();
      }
  }

  // ==================== MAIN ACTIONS ====================
  function openExperience() {
      console.log('체험하기 버튼 클릭됨');
      openExternalLink(CONFIG.EXPERIENCE_URL);
      tutorial.resetInactivityTimer();
  }

  function openApply() {
      console.log('체험계정 신청 버튼 클릭됨');
      openExternalLink(CONFIG.APPLY_URL_BASE);
      tutorial.resetInactivityTimer();
  }

  function openGuide() {
      console.log('사용법 가이드 버튼 클릭됨');
      openExternalLink(CONFIG.GUIDE_URL);
      tutorial.resetInactivityTimer();
  }

  function showTutorial() {
      console.log('튜토리얼 버튼 클릭됨');
      tutorial.show();
  }

  function showStaffCall() {
      console.log('스태프 호출 버튼 클릭됨');
      staffCall.show();
  }

  // ==================== TUTORIAL VIDEO ====================
  function showTutorialVideo() {
      console.log('시연 영상 보기 버튼 클릭됨');
      const step = TUTORIAL_STEPS[tutorial.currentStep];

      if (step && step.hasVideo) {
          const videoContainer =
  document.getElementById(`video-container-${step.id}`);
          const placeholder =
  document.querySelector('.placeholder-img.with-video');

          if (videoContainer && placeholder) {
              // 플레이스홀더 숨기고 비디오 컨테이너 보이기
              placeholder.style.display = 'none';
              videoContainer.style.display = 'block';

              // 체크박스 자동 체크
              setTimeout(() => {
                  const checkbox = document.getElementById(step.id);
                  if (checkbox && !checkbox.checked) {
                      checkbox.checked = true;
                      tutorial.toggleStep(step.id);
                  }
              }, 2000);

              tutorial.resetInactivityTimer();
          }
      }
  }

  // ==================== USER ACTIVITY TRACKING ====================
  function trackUserActivity() {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll',
  'touchstart', 'click'];

      events.forEach(event => {
          document.addEventListener(event, () => {
              tutorial.resetInactivityTimer();
          }, { passive: true });
      });
  }

  // ==================== KEYBOARD ACCESSIBILITY ====================
  function initKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
          // 전체화면 토글 (F11)
          if (e.key === 'F11') {
              e.preventDefault();
              if (document.fullscreenElement) {
                  document.exitFullscreen();
              } else {
                  document.documentElement.requestFullscreen();
              }
          }

          // 메인 액션 단축키
          if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                  case '1':
                      e.preventDefault();
                      openExperience();
                      break;
                  case '2':
                      e.preventDefault();
                      showTutorial();
                      break;
                  case '3':
                      e.preventDefault();
                      openApply();
                      break;
                  case 'h':
                      e.preventDefault();
                      showStaffCall();
                      break;
              }
          }

          // ESC로 모든 모달 닫기
          if (e.key === 'Escape') {
              tutorial.hide();
              staffCall.hide();
          }
      });
  }

  // ==================== STICKY DOCK ====================
  function initStickyDock() {
      const stickyHTML = `
          <div class="sticky-dock" id="stickyDock">
              <button class="dock-btn primary" onclick="openExperience()" 
  title="체험하기 (Ctrl+1)">
                  🚀 체험하기
              </button>
              <button class="dock-btn secondary" onclick="showTutorial()" 
  title="튜토리얼 (Ctrl+2)">
                  📚 튜토리얼
              </button>
              <button class="dock-btn success" onclick="openApply()" 
  title="체험계정 신청 (Ctrl+3)">
                  ✨ 신청
              </button>
          </div>
      `;

      document.body.insertAdjacentHTML('beforeend', stickyHTML);
  }

  // ==================== INITIALIZATION ====================
  let tutorial, staffCall;

  document.addEventListener('DOMContentLoaded', function() {
      console.log('수학대왕 CLASS 키오스크 시스템 초기화');

      // 인스턴스 생성
      tutorial = new TutorialWizard();
      staffCall = new StaffCall();

      // 기능 초기화
      trackUserActivity();
      initKeyboardNavigation();
      initStickyDock();

      console.log('키오스크 시스템 준비 완료');
  });
