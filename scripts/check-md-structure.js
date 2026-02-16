#!/usr/bin/env node

/**
 * MD File Structure Checker
 * 
 * 이 스크립트는 MD 파일들이 올바른 위치에 있는지 확인하고
 * 잘못 배치된 파일들을 찾아내어 경고합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 허용된 MD 파일 위치 규칙
const ALLOWED_PATTERNS = {
  // 루트에 허용된 파일들
  root: ['README.md', 'CLAUDE.md'],
  
  // 폴더별 허용 패턴
  'docs/': [
    'README.md',           // 문서 인덱스
    'ARCHITECTURE.md',     // 시스템 구조
    'DEPLOYMENT.md',       // 배포 가이드
    'API_REFERENCE.md',    // API 문서
    'SETUP_GUIDE.md',      // 설치 가이드
    'CHANGELOG.md',        // 변경 이력
    '*_GUIDE.md',          // 기타 가이드들
    '*_REFERENCE.md',      // 기타 레퍼런스들
    'MD_FILE_MANAGEMENT_STRATEGY.md' // 관리 전략
  ],
  
  'config/': [
    '*_SETUP.md',          // 서비스 설정 문서
    '*_STRATEGY.md',       // 전략 문서
    '*_CONFIG.md'          // 설정 문서
  ],
  
  '.ai-workflow/': [
    '*'                    // AI 워크플로우는 건드리지 않음
  ]
};

// 금지된 패턴들
const FORBIDDEN_PATTERNS = [
  // 날짜가 포함된 파일명 (AI 워크플로우 제외)
  /^(?!\.ai-workflow\/).*\/.*\d{4}-\d{2}-\d{2}.*\.md$/,
  
  // 루트에 설정 관련 파일
  /^[A-Z_]+_SETUP\.md$/,
  /^[A-Z_]+_CONFIG\.md$/,
  /^[A-Z_]+_STRATEGY\.md$/,
  
  // client/ 폴더 내 MD 파일
  /^client\/.*\.md$/,
  
  // server/ 폴더 내 MD 파일  
  /^server\/.*\.md$/
];

/**
 * 와일드카드 패턴 매칭
 */
function matchesPattern(filename, pattern) {
  if (pattern === '*') return true;
  
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return regex.test(filename);
}

/**
 * 파일이 허용된 위치에 있는지 확인
 */
function isFileAllowed(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  const filename = path.basename(filePath);
  
  // .ai-workflow/ 폴더는 모든 파일 허용
  if (relativePath.startsWith('.ai-workflow/')) {
    return true;
  }
  
  // 루트 파일 확인
  if (!relativePath.includes('/')) {
    return ALLOWED_PATTERNS.root.includes(filename);
  }
  
  // 폴더별 확인
  for (const [folder, patterns] of Object.entries(ALLOWED_PATTERNS)) {
    if (folder === 'root') continue;
    
    if (relativePath.startsWith(folder)) {
      const fileInFolder = relativePath.replace(folder, '');
      
      // 하위 폴더에 있는 파일은 허용하지 않음 (평평한 구조 유지)
      if (fileInFolder.includes('/')) {
        return false;
      }
      
      return patterns.some(pattern => matchesPattern(fileInFolder, pattern));
    }
  }
  
  return false;
}

/**
 * 금지된 패턴인지 확인
 */
function isForbiddenPattern(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(relativePath));
}

/**
 * MD 파일 재귀 검색
 */
function findMdFiles(dir, mdFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // node_modules와 .git 폴더는 제외
      if (!['node_modules', '.git', '.next', 'dist'].includes(file)) {
        findMdFiles(filePath, mdFiles);
      }
    } else if (file.endsWith('.md')) {
      mdFiles.push(filePath);
    }
  }
  
  return mdFiles;
}

/**
 * 문제 파일들에 대한 제안사항 생성
 */
function generateSuggestions(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  const filename = path.basename(filePath);
  
  const suggestions = [];
  
  // 설정 관련 파일
  if (filename.includes('SETUP') || filename.includes('CONFIG') || filename.includes('STRATEGY')) {
    suggestions.push(`📁 config/ 폴더로 이동: mv "${relativePath}" "config/${filename}"`);
  }
  
  // 가이드나 문서
  if (filename.includes('GUIDE') || filename.includes('REFERENCE') || filename.includes('ARCHITECTURE')) {
    suggestions.push(`📚 docs/ 폴더로 이동: mv "${relativePath}" "docs/${filename}"`);
  }
  
  // 날짜가 포함된 파일
  if (/\d{4}-\d{2}-\d{2}/.test(filename) && !relativePath.startsWith('.ai-workflow/')) {
    suggestions.push(`🤖 .ai-workflow/ 폴더로 이동하거나 내용을 기존 문서에 통합`);
  }
  
  // client/server 폴더 내 MD 파일
  if (relativePath.startsWith('client/') || relativePath.startsWith('server/')) {
    suggestions.push(`📋 docs/ARCHITECTURE.md에 통합하거나 docs/ 폴더로 이동`);
  }
  
  return suggestions;
}

/**
 * 메인 체크 함수
 */
function checkMdStructure() {
  console.log('🔍 MD 파일 구조 검사를 시작합니다...\n');
  
  const mdFiles = findMdFiles(rootDir);
  const issues = [];
  
  for (const filePath of mdFiles) {
    const relativePath = path.relative(rootDir, filePath);
    
    // 허용되지 않은 위치
    if (!isFileAllowed(filePath)) {
      issues.push({
        type: 'wrong_location',
        file: relativePath,
        message: '허용되지 않은 위치에 있는 MD 파일',
        suggestions: generateSuggestions(filePath)
      });
    }
    
    // 금지된 패턴
    if (isForbiddenPattern(filePath)) {
      issues.push({
        type: 'forbidden_pattern',
        file: relativePath,
        message: '금지된 파일명 패턴',
        suggestions: generateSuggestions(filePath)
      });
    }
  }
  
  // 결과 출력
  if (issues.length === 0) {
    console.log('✅ 모든 MD 파일이 올바른 위치에 있습니다!');
    console.log(`📊 총 ${mdFiles.length}개의 MD 파일을 검사했습니다.\n`);
    
    // 현재 구조 출력
    console.log('📁 현재 MD 파일 구조:');
    const structure = {};
    
    for (const filePath of mdFiles) {
      const relativePath = path.relative(rootDir, filePath);
      const dir = path.dirname(relativePath);
      const filename = path.basename(relativePath);
      
      if (!structure[dir]) structure[dir] = [];
      structure[dir].push(filename);
    }
    
    for (const [dir, files] of Object.entries(structure)) {
      console.log(`  ${dir === '.' ? 'Root' : dir}/`);
      for (const file of files.sort()) {
        console.log(`    └── ${file}`);
      }
    }
    
    process.exit(0);
  } else {
    console.log(`❌ ${issues.length}개의 문제를 발견했습니다:\n`);
    
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. 🚨 ${issue.file}`);
      console.log(`   문제: ${issue.message}`);
      
      if (issue.suggestions.length > 0) {
        console.log('   💡 제안사항:');
        issue.suggestions.forEach(suggestion => {
          console.log(`      ${suggestion}`);
        });
      }
      
      console.log('');
    });
    
    console.log('📋 해결 방법:');
    console.log('1. 위의 제안사항을 따라 파일을 올바른 위치로 이동');
    console.log('2. 또는 docs/MD_FILE_MANAGEMENT_STRATEGY.md를 참조하여 적절한 위치 결정');
    console.log('3. 수정 후 다시 이 스크립트를 실행하여 확인\n');
    
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  checkMdStructure();
}