package config

import "gorm.io/gorm"

func seedStudentModuleData(db *gorm.DB) {
	seedKencanaData(db)
	seedScholarshipData(db)
	seedCounselingData(db)
	seedHealthData(db)
	seedStudentVoiceData(db)
	seedOrganisasiData(db)
	seedDashboardData(db)
	seedNotificationData(db)
}
