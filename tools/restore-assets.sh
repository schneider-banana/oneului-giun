#!/bin/sh
# 오늘의기운 에셋 복원 스크립트 (최초 클론 후 1회 실행)
#
# 배경: GitHub MCP로는 바이너리(PNG) 업로드가 안 돼서 아이콘 파일이 리포지토리에 없음.
# 이 스크립트가 오늘의기운 전용 아이콘(해 뜨는 디자인)을 다운로드한다.
# 링크는 Muse 내장 스토리지라 2026-10-19 이후 만료됨 — 만료 전에 받아두면
# 맥에 영구 저장되니 이후엔 필요 없음.
#
# 사용법: sh tools/restore-assets.sh

set -e
ASSETS_DIR="$(dirname "$0")/../assets"
mkdir -p "$ASSETS_DIR"
cd "$ASSETS_DIR"

download() {
  echo "다운로드: $1"
  curl -sSL -o "$1" "$2"
}

download "icon.png" "https://muse.ai/files/1429880630189995/1459379309422817/rgd2olbes699jg7v3nbbhfl9/oneului-icon.png"
download "android-icon-foreground.png" "https://muse.ai/files/1429880630189995/1579118920654937/i14cz3ehotm3ue3hnof86khz/oneului-android-foreground.png"
download "android-icon-background.png" "https://muse.ai/files/1429880630189995/2172149663721907/eufs2v8csgig2j8rz4y8z3xy/oneului-android-background.png"
download "android-icon-monochrome.png" "https://muse.ai/files/1429880630189995/1688801763244883/3zzmy8exjfcjfe2mj9wtnprc/oneului-android-monochrome.png"
download "favicon.png" "https://muse.ai/files/1429880630189995/1369812601893949/sfnq2j0o8el1adriwsz6j9pk/oneului-favicon.png"
download "splash-icon.png" "https://muse.ai/files/1429880630189995/1370501018489603/azebmff8bp7l416383imo0wt/oneului-splash.png"

echo "완료. assets/ 폴더 확인."
