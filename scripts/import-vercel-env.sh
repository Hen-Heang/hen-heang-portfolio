#!/usr/bin/env bash
set -euo pipefail

target="${1:-production,preview}"
env_file="${2:-.env.vercel.local}"

case "$target" in
  production|preview|development|production,preview|production,development|preview,development|production,preview,development) ;;
  *) echo "Invalid target: $target" >&2; exit 1 ;;
esac

if [[ ! -f "$env_file" ]]; then
  echo "Environment file not found: $env_file" >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed." >&2
  exit 1
fi

imported=0
skipped=0

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ -z "$line" || "$line" == \#* ]] && continue

  if [[ "$line" != *=* ]]; then
    echo "Invalid line in $env_file: $line" >&2
    exit 1
  fi

  key="${line%%=*}"
  value="${line#*=}"

  if [[ ! "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "Invalid variable name: $key" >&2
    exit 1
  fi

  if [[ -z "$value" ]]; then
    echo "Skipping blank variable: $key"
    skipped=$((skipped + 1))
    continue
  fi

  first="${value:0:1}"
  last="${value:${#value}-1:1}"
  if [[ ${#value} -ge 2 && ( ( "$first" == '"' && "$last" == '"' ) || ( "$first" == "'" && "$last" == "'" ) ) ]]; then
    value="${value:1:${#value}-2}"
  fi

  visibility=--no-sensitive
  case "$key" in
    OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|UPSTASH_REDIS_REST_TOKEN) visibility=--sensitive ;;
  esac

  printf %s "$value" | vercel env add "$key" "$target" --force --yes "$visibility"
  imported=$((imported + 1))
done < "$env_file"

echo "Imported $imported variable(s) into Vercel target(s): $target. Skipped $skipped blank variable(s)."
