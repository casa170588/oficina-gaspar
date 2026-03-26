export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ordens_servico: {
        Row: {
          created_at: string
          descricao: string
          foto_peca_antiga: string | null
          foto_peca_nova: string | null
          frota: string
          id: string
          numero_os: number | null
          placa: string
          status: string
          tecnico_cpf: string
          tecnico_nome: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string
          foto_peca_antiga?: string | null
          foto_peca_nova?: string | null
          frota?: string
          id?: string
          numero_os?: number | null
          placa?: string
          status?: string
          tecnico_cpf?: string
          tecnico_nome?: string
          tipo?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          foto_peca_antiga?: string | null
          foto_peca_nova?: string | null
          frota?: string
          id?: string
          numero_os?: number | null
          placa?: string
          status?: string
          tecnico_cpf?: string
          tecnico_nome?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      os_fotos: {
        Row: {
          created_at: string
          foto_url: string
          id: string
          os_id: string
        }
        Insert: {
          created_at?: string
          foto_url: string
          id?: string
          os_id: string
        }
        Update: {
          created_at?: string
          foto_url?: string
          id?: string
          os_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_fotos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      os_pecas: {
        Row: {
          id: string
          os_id: string
          peca_codigo: string
          peca_nome: string
          quantidade: number
        }
        Insert: {
          id?: string
          os_id: string
          peca_codigo: string
          peca_nome: string
          quantidade?: number
        }
        Update: {
          id?: string
          os_id?: string
          peca_codigo?: string
          peca_nome?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_pecas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      patio: {
        Row: {
          carga: string
          created_at: string
          eixos: string
          frota: string
          id: string
          motivo_bloqueio: string | null
          placa: string
          situacao: string
          tipo_veiculo: string
          updated_at: string
        }
        Insert: {
          carga?: string
          created_at?: string
          eixos?: string
          frota?: string
          id?: string
          motivo_bloqueio?: string | null
          placa?: string
          situacao?: string
          tipo_veiculo?: string
          updated_at?: string
        }
        Update: {
          carga?: string
          created_at?: string
          eixos?: string
          frota?: string
          id?: string
          motivo_bloqueio?: string | null
          placa?: string
          situacao?: string
          tipo_veiculo?: string
          updated_at?: string
        }
        Relationships: []
      }
      pecas: {
        Row: {
          codigo: string
          created_at: string
          id: string
          nome: string
          quantidade: number
          tipo: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          nome: string
          quantidade?: number
          tipo?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          quantidade?: number
          tipo?: string
        }
        Relationships: []
      }
      pneus: {
        Row: {
          created_at: string
          id: string
          medida: string
          numero_fogo: string
          quantidade: number
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          medida: string
          numero_fogo?: string
          quantidade?: number
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: string
          medida?: string
          numero_fogo?: string
          quantidade?: number
          tipo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string
          created_at: string
          id: string
          login: string
          nivel: string
          nome: string
          permissoes: string[]
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string
          created_at?: string
          id?: string
          login?: string
          nivel?: string
          nome: string
          permissoes?: string[]
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string
          created_at?: string
          id?: string
          login?: string
          nivel?: string
          nome?: string
          permissoes?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
