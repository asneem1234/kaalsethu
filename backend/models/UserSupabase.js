import supabase from '../config/supabase.js';
import bcrypt from 'bcrypt';

class UserSupabase {
    // Create a new user
    static async create({ name, email, password }) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        name,
                        email: email.toLowerCase(),
                        password: hashedPassword
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }

    // Update user
    static async update(id, updates) {
        try {
            // If updating password, hash it
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Delete user
    static async delete(id) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Get all users (admin function)
    static async findAll() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }
}

export default UserSupabase;
