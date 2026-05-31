import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registerFarmerOnChain } from '@/lib/blockchain';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { farmerId, name, mobile, aadhaarLast4, profileId } = await req.json();

    // Verify that the requested profileId belongs to the authenticated user to prevent IDOR
    if (user.id !== profileId) {
      return NextResponse.json({ success: false, error: 'Forbidden: Profile ID mismatch' }, { status: 403 });
    }

    const result = await registerFarmerOnChain(farmerId, name, mobile, aadhaarLast4);

    if (result.success && result.txHash) {
      const db = supabase as any;
      await db
        .from('farmer_profiles')
        .update({
          blockchain_tx_hash: result.txHash,
          blockchain_block_number: result.blockNumber,
          blockchain_registered_at: new Date().toISOString(),
          contract_address: process.env.CONTRACT_ADDRESS,
        })
        .eq('id', profileId);

      return NextResponse.json({ success: true, txHash: result.txHash });
    }

    return NextResponse.json({ success: false });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}