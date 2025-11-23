import supabase from '../config/supabase.js';

class TimeCapsuleSupabase {
    // Create a new time capsule
    static async create(capsuleData) {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .insert([capsuleData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating time capsule:', error);
            throw error;
        }
    }

    // Find capsules by user ID
    static async findByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error finding capsules by user:', error);
            throw error;
        }
    }

    // Find capsule by ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error finding capsule by ID:', error);
            throw error;
        }
    }

    // Find capsules ready to be opened
    static async findReadyToOpen() {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .select('*')
                .lte('open_date', new Date().toISOString())
                .eq('is_sent', false)
                .order('open_date', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error finding capsules ready to open:', error);
            throw error;
        }
    }

    // Update capsule
    static async update(id, updates) {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating capsule:', error);
            throw error;
        }
    }

    // Mark capsule as sent
    static async markAsSent(id) {
        try {
            return await this.update(id, { is_sent: true });
        } catch (error) {
            console.error('Error marking capsule as sent:', error);
            throw error;
        }
    }

    // Delete capsule
    static async delete(id) {
        try {
            const { error } = await supabase
                .from('time_capsules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting capsule:', error);
            throw error;
        }
    }

    // Get capsule count by user
    static async countByUserId(userId) {
        try {
            const { count, error } = await supabase
                .from('time_capsules')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) throw error;
            return count;
        } catch (error) {
            console.error('Error counting capsules:', error);
            throw error;
        }
    }

    // Get all capsules (admin function)
    static async findAll() {
        try {
            const { data, error } = await supabase
                .from('time_capsules')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching all capsules:', error);
            throw error;
        }
    }
}

export default TimeCapsuleSupabase;
