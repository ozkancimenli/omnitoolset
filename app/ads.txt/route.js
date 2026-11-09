// AdSense onaylanınca NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-... girilir; ads.txt kendiliğinden doğru satırı verir.
export const dynamic = 'force-static';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-5191848106800958';
  const pub = client.replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# ads.txt — no ad sellers configured yet\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
