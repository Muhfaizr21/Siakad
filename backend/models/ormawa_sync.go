package models

import (
	"log"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// --- DELETE HOOKS ---
func (o *Ormawa) AfterDelete(tx *gorm.DB) (err error) {
	return tx.Table("fakultas_admin.organisasi_mahasiswa").Where("id = ?", o.ID).Delete(nil).Error
}

func (p *Proposal) AfterDelete(tx *gorm.DB) (err error) {
	return tx.Table("fakultas_admin.proposal_ormawa").Where("id = ?", p.ID).Delete(nil).Error
}
// --------------------

// AfterSave Hook untuk Ormawa (Pusat) -> Mirroring ke fakultas_admin (Silo)
func (o *Ormawa) AfterSave(tx *gorm.DB) (err error) {
	return SyncOrmawaToFaculty(tx, o)
}

// AfterSave Hook untuk Proposal (Pusat) -> Mirroring ke fakultas_admin (Silo)
func (p *Proposal) AfterSave(tx *gorm.DB) (err error) {
	return SyncProposalToFaculty(tx, p)
}

func SyncOrmawaToFaculty(db *gorm.DB, ormawa *Ormawa) error {
	fakOrg := OrganisasiMahasiswa{
		ID:            ormawa.ID,
		KodeOrg:       ormawa.OrgCode,
		NamaOrg:       ormawa.Name,
		Status:        ormawa.Status,
		Deskripsi:     ormawa.Description,
	}

	err := db.Table("fakultas_admin.organisasi_mahasiswa").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"kode_org", "nama_org", "status", "deskripsi", "diperbarui_pada"}),
	}).Create(&fakOrg).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal sinkronisasi Ormawa %s ke fakultas_admin: %v", ormawa.Name, err)
	}
	return err
}

func SyncProposalToFaculty(db *gorm.DB, proposal *Proposal) error {
	fakProp := ProposalOrmawa{
		ID:           proposal.ID,
		OrgID:        proposal.OrmawaID,
		Judul:        proposal.Title,
		Deskripsi:    proposal.Description,
		Anggaran:     proposal.Budget,
		DokumenURL:   proposal.FileUrl,
		Status:       proposal.Status,
		CatatanAdmin: proposal.Notes,
		DibuatPada:   proposal.CreatedAt,
	}

	err := db.Table("fakultas_admin.proposal_ormawa").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"judul", "deskripsi", "anggaran", "dokumen_url", "status", "catatan_admin", "diperbarui_pada"}),
	}).Create(&fakProp).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal sinkronisasi Proposal %s ke fakultas_admin: %v", proposal.Title, err)
	}
	return err
}
