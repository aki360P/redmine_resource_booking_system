class AddColumn < ActiveRecord::CompatibleLegacyMigration.migration_class
  #for redmine 3x,  ActiveRecord::Migration
  #for redmine 4x,  ActiveRecord::Migration[4.2]
  
  def self.up
    add_column :rrbs_settings, :custom_field_id_text, :integer
    add_column :rrbs_settings, :issue_status_id_cancel, :integer
  end

  def self.down
    remove_column :rrbs_settings, :custom_field_id_text
    remove_column :rrbs_settings, :issue_status_id_cancel
  end
end
