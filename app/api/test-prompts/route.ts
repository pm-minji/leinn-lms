import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test with regular client
    const supabase = await createClient();
    const { data: regularData, error: regularError } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .limit(1);

    // Test with admin client
    const adminClient = createAdminClient();
    const { data: adminData, error: adminError } = await adminClient
      .from('ai_prompt_templates')
      .select('*')
      .limit(1);

    return NextResponse.json({
      regular_client: {
        success: !regularError,
        error: regularError?.message,
        data_count: regularData?.length || 0,
      },
      admin_client: {
        success: !adminError,
        error: adminError?.message,
        data_count: adminData?.length || 0,
      },
      table_exists: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: (error as Error).message,
    }, { status: 500 });
  }
}