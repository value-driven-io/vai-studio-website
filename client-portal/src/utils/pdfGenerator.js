// utils/pdfGenerator.js
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

/**
 * Professional PDF Generator for VAI Studio Client Proposals
 * Modular utility for generating branded proposal documents
 * 
 * FIXED: Corrected jsPDF-autoTable import and initialization
 */
class VAIPDFGenerator {
  constructor() {
    this.doc = null
    this.currentY = 20
    this.pageWidth = 210 // A4 width in mm
    this.pageHeight = 297 // A4 height in mm
    this.margin = 20
    this.colors = {
      primary: '#FF6B6B', // VAI Coral
      secondary: '#4ECDC4', // VAI Teal  
      dark: '#2C3E50', // VAI Deep Ocean
      text: '#34495E',
      light: '#ECF0F1',
      accent: '#F39C12' // VAI Sunset
    }
  }

  /**
     * Initialize new PDF document with autoTable plugin
     */
    initDocument() {
  try {
    this.doc = new jsPDF('portrait', 'mm', 'a4')
    this.currentY = 20
    
    // Check if autoTable is available, but don't fail if it's not
    this.hasAutoTable = typeof this.doc.autoTable === 'function'
    
    if (!this.hasAutoTable) {
      console.warn('autoTable not available, using text-based fallbacks')
    }
    
    return this.doc
  } catch (error) {
    console.error('Failed to initialize PDF document:', error)
    throw error
  }
}

  /**
   * Format currency for French Polynesia
   */
  formatCurrency(amount) {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Non défini'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Add VAI Studio header with branding
   */
  addHeader() {
    const doc = this.doc
    
    // Background banner
    doc.setFillColor(44, 62, 80) // VAI Deep Ocean
    doc.rect(0, 0, this.pageWidth, 40, 'F')
    
    // VAI Studio logo area (placeholder for actual logo)
    doc.setFillColor(255, 107, 107) // VAI Coral
    doc.circle(25, 20, 8, 'F')
    
    // Company name and tagline
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('VAI STUDIO', 40, 18)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('International Quality. Island Style.', 40, 25)
    
    // Contact info
    doc.setFontSize(8)
    doc.text('Moorea, French Polynesia • hello@vai.studio • +689 87 26 90 65', 40, 32)
    
    this.currentY = 50
  }

  /**
   * Add proposal title section
   */
  addProposalTitle(clientData) {
    const doc = this.doc
    
    doc.setTextColor(44, 62, 80)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PROPOSITION DE TRANSFORMATION DIGITALE', this.margin, this.currentY)
    
    this.currentY += 10
    
    doc.setFontSize(16)
    doc.setTextColor(255, 107, 107) // VAI Coral
    doc.text(`${clientData?.company_name || 'Client'}`, this.margin, this.currentY)
    
    this.currentY += 15
    
    // Proposal date
    doc.setFontSize(10)
    doc.setTextColor(52, 73, 94)
    doc.text(`Proposition générée le: ${this.formatDate(new Date().toISOString())}`, this.margin, this.currentY)
    
    this.currentY += 20
  }

  /**
   * Add client information section using simple text (fallback for autoTable issues)
   */
  addClientSection(clientData) {
    const doc = this.doc
    this.addSectionTitle('INFORMATIONS CLIENT')
    
    // Skip autoTable attempt if not available
    if (!this.hasAutoTable) {
        this.addClientSectionFallback(clientData)
        return
    }
    
    try {
        const clientInfo = [
        ['Entreprise', clientData?.company_name || ''],
        ['Contact', clientData?.client_name || ''],
        ['Email', clientData?.email || ''],
        ['Téléphone/WhatsApp', clientData?.whatsapp || clientData?.phone || ''],
        ['Localisation', clientData?.island || 'French Polynesia'],
        ['Statut du projet', this.getStatusLabel(clientData?.project_status) || '']
        ]

        doc.autoTable({
        startY: this.currentY,
        head: [],
        body: clientInfo,
        theme: 'plain',
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, fillColor: [248, 249, 250] },
            1: { cellWidth: 100 }
        },
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        margin: { left: this.margin }
        })

        this.currentY = doc.lastAutoTable.finalY + 15
    } catch (error) {
        console.warn('AutoTable failed, using fallback:', error)
        this.addClientSectionFallback(clientData)
    }
    }

addClientSectionFallback(clientData) {
  const doc = this.doc
  
  doc.setFontSize(10)
  doc.setTextColor(52, 73, 94)
  
  const clientInfo = [
    `Entreprise: ${clientData?.company_name || ''}`,
    `Contact: ${clientData?.client_name || ''}`,
    `Email: ${clientData?.email || ''}`,
    `Téléphone/WhatsApp: ${clientData?.whatsapp || clientData?.phone || ''}`,
    `Localisation: ${clientData?.island || 'French Polynesia'}`,
    `Statut du projet: ${this.getStatusLabel(clientData?.project_status) || ''}`
  ]
  
  clientInfo.forEach(info => {
    doc.text(info, this.margin, this.currentY)
    this.currentY += 6
  })
  
  this.currentY += 15
}

  /**
   * Add package configuration section
   */
  addPackageSection(proposalData, calculatedPricing) {
    const doc = this.doc
    this.addSectionTitle('CONFIGURATION DU PACKAGE')
    
    // Skip autoTable if not available
    if (!this.hasAutoTable) {
        this.addPackageSectionFallback(proposalData, calculatedPricing)
        return
    }
    
    try {
        // Base package
        const packageData = [
        ['Package de base', 'Smart Setup Package', this.formatCurrency(250000)],
        ]

        // Add package deals
        if (proposalData?.package_configuration?.package_deals?.length > 0) {
        proposalData.package_configuration.package_deals.forEach(deal => {
            packageData.push([
            'Package groupé',
            `${deal.name} (Économies: ${this.formatCurrency(deal.savings)})`,
            this.formatCurrency(deal.cost)
            ])
        })
        }

        // Add individual add-ons
        if (proposalData?.package_configuration?.add_ons?.length > 0) {
        proposalData.package_configuration.add_ons.forEach(addon => {
            packageData.push([
            'Service complémentaire',
            addon.name,
            this.formatCurrency(addon.cost)
            ])
        })
        }

        doc.autoTable({
        startY: this.currentY,
        head: [['Type', 'Description', 'Coût']],
        body: packageData,
        theme: 'striped',
        headStyles: {
            fillColor: [255, 107, 107], // VAI Coral
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 90 },
            2: { cellWidth: 30, halign: 'right' }
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        },
        margin: { left: this.margin }
        })

        this.currentY = doc.lastAutoTable.finalY + 15
    } catch (error) {
        console.warn('AutoTable failed for package section, using fallback:', error)
        this.addPackageSectionFallback(proposalData, calculatedPricing)
    }
    }

    addPackageSectionFallback(proposalData, calculatedPricing) {
    const doc = this.doc
    
    // Enhanced fallback with better formatting
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 107, 107)
    doc.text('Type', this.margin, this.currentY)
    doc.text('Description', this.margin + 50, this.currentY)
    doc.text('Coût', this.margin + 140, this.currentY)
    
    // Underline headers
    doc.setDrawColor(255, 107, 107)
    doc.setLineWidth(0.3)
    doc.line(this.margin, this.currentY + 2, this.margin + 160, this.currentY + 2)
    
    this.currentY += 8
    
    // Content
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(52, 73, 94)
    
    doc.text('Package de base', this.margin, this.currentY)
    doc.text('Smart Setup Package', this.margin + 50, this.currentY)
    doc.text(this.formatCurrency(250000), this.margin + 140, this.currentY)
    this.currentY += 6
    
    if (proposalData?.package_configuration?.package_deals?.length > 0) {
        proposalData.package_configuration.package_deals.forEach(deal => {
        doc.text('Package groupé', this.margin, this.currentY)
        doc.text(`${deal.name}`, this.margin + 50, this.currentY)
        doc.text(this.formatCurrency(deal.cost), this.margin + 140, this.currentY)
        this.currentY += 6
        })
    }
    
    if (proposalData?.package_configuration?.add_ons?.length > 0) {
        proposalData.package_configuration.add_ons.forEach(addon => {
        doc.text('Service complémentaire', this.margin, this.currentY)
        doc.text(addon.name, this.margin + 50, this.currentY)
        doc.text(this.formatCurrency(addon.cost), this.margin + 140, this.currentY)
        this.currentY += 6
        })
    }
    
    this.currentY += 15
    }
  /**
   * Add financial summary section
   */
  addFinancialSection(calculatedPricing) {
  const doc = this.doc
  this.addSectionTitle('RÉSUMÉ FINANCIER')
  
  if (!this.hasAutoTable) {
    this.addFinancialSectionFallback(calculatedPricing)
    return
  }
  
  try {
    const financialData = [
      ['Sous-total VAI Studio', this.formatCurrency(calculatedPricing?.total_vai_cost)],
      ['Coûts externes (PayZen/PayPal)', this.formatCurrency(calculatedPricing?.external_costs)],
    ]

    if (calculatedPricing?.package_savings > 0) {
      financialData.push(['Économies totales', `-${this.formatCurrency(calculatedPricing.package_savings)}`])
    }

    financialData.push(['INVESTISSEMENT TOTAL', this.formatCurrency(calculatedPricing?.total_investment)])
    financialData.push(['Coûts mensuels', this.formatCurrency(calculatedPricing?.monthly_operating || 5400)])

    doc.autoTable({
      startY: this.currentY,
      head: [],
      body: financialData,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        fontSize: 11,
        cellPadding: 4
      },
      margin: { left: this.margin },
      didParseCell: function(data) {
        // Highlight total investment row
        if (data.row.index === financialData.length - 2) {
          data.cell.styles.fillColor = [255, 107, 107] // VAI Coral
          data.cell.styles.textColor = 255
          data.cell.styles.fontSize = 12
        }
      }
    })

    this.currentY = doc.lastAutoTable.finalY + 15
  } catch (error) {
    console.warn('AutoTable failed for financial section, using fallback:', error)
    this.addFinancialSectionFallback(calculatedPricing)
  }
}

    addFinancialSectionFallback(calculatedPricing) {
    const doc = this.doc
    
    // Enhanced fallback with proper alignment
    doc.setFontSize(11)
    doc.setTextColor(52, 73, 94)
    
    const lineHeight = 8
    const labelWidth = 120
    
    // Regular items
    doc.setFont('helvetica', 'normal')
    doc.text('Sous-total VAI Studio:', this.margin, this.currentY)
    doc.text(this.formatCurrency(calculatedPricing?.total_vai_cost), this.margin + labelWidth, this.currentY)
    this.currentY += lineHeight
    
    doc.text('Coûts externes (PayZen/PayPal):', this.margin, this.currentY)
    doc.text(this.formatCurrency(calculatedPricing?.external_costs), this.margin + labelWidth, this.currentY)
    this.currentY += lineHeight
    
    if (calculatedPricing?.package_savings > 0) {
        doc.text('Économies totales:', this.margin, this.currentY)
        doc.text(`-${this.formatCurrency(calculatedPricing.package_savings)}`, this.margin + labelWidth, this.currentY)
        this.currentY += lineHeight
    }
    
    // Highlighted total
    doc.setFillColor(255, 107, 107)
    doc.rect(this.margin - 3, this.currentY - 5, 160, 12, 'F')
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('INVESTISSEMENT TOTAL:', this.margin, this.currentY)
    doc.text(this.formatCurrency(calculatedPricing?.total_investment), this.margin + labelWidth, this.currentY)
    this.currentY += 12
    
    // Monthly costs
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(52, 73, 94)
    doc.text('Coûts mensuels:', this.margin, this.currentY)
    doc.text(this.formatCurrency(calculatedPricing?.monthly_operating || 5400), this.margin + labelWidth, this.currentY)
    this.currentY += 15
    }

  /**
   * Add services included section
   */
  addServicesSection() {
    const doc = this.doc
    
    this.addSectionTitle('SERVICES INCLUS - SMART SETUP PACKAGE')
    
    const services = [
      '✓ Site web professionnel bilingue (français/anglais)',
      '✓ Système de réservation en ligne intégré',
      '✓ Configuration des paiements sécurisés',
      '✓ Optimisation Google Business Profile',
      '✓ Inscription sur 3 plateformes majeures',
      '✓ Formation complète et documentation',
      '✓ Support technique pendant 30 jours',
      '✓ Hébergement et nom de domaine (1ère année)',
      '✓ Optimisation mobile et tablette',
      '✓ Certificat SSL et sécurité avancée'
    ]

    doc.setFontSize(10)
    doc.setTextColor(52, 73, 94)
    
    services.forEach(service => {
      doc.text(service, this.margin, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10
  }

  /**
   * Add timeline section
   */
  addTimelineSection(clientData) {
    const doc = this.doc
    this.addSectionTitle('CHRONOLOGIE DU PROJET')
    
    if (!this.hasAutoTable) {
        this.addTimelineSectionFallback(clientData)
        return
    }
    
    try {
        const timelineData = [
        ['Phase 1', 'Configuration et planification', '1 semaine'],
        ['Phase 2', 'Développement du site web', '2 semaines'],
        ['Phase 3', 'Intégration et tests', '1 semaine'],
        ['Phase 4', 'Formation et lancement', '1 semaine'],
        ]

        if (clientData?.proposed_start_date) {
        timelineData.push(['Date de début prévue', this.formatDate(clientData.proposed_start_date), ''])
        }
        if (clientData?.estimated_completion_date) {
        timelineData.push(['Achèvement estimé', this.formatDate(clientData.estimated_completion_date), ''])
        }

        doc.autoTable({
        startY: this.currentY,
        head: [['Phase', 'Description', 'Durée']],
        body: timelineData,
        theme: 'striped',
        headStyles: {
            fillColor: [78, 205, 196], // VAI Teal
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        },
        margin: { left: this.margin }
        })

        this.currentY = doc.lastAutoTable.finalY + 15
    } catch (error) {
        console.warn('AutoTable failed for timeline section, using fallback:', error)
        this.addTimelineSectionFallback(clientData)
    }
    }

    addTimelineSectionFallback(clientData) {
    const doc = this.doc
    
    // Enhanced timeline fallback
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(78, 205, 196)
    doc.text('Phase', this.margin, this.currentY)
    doc.text('Description', this.margin + 40, this.currentY)
    doc.text('Durée', this.margin + 120, this.currentY)
    
    doc.setDrawColor(78, 205, 196)
    doc.setLineWidth(0.3)
    doc.line(this.margin, this.currentY + 2, this.margin + 150, this.currentY + 2)
    
    this.currentY += 8
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(52, 73, 94)
    
    const phases = [
        ['Phase 1', 'Configuration et planification', '1 semaine'],
        ['Phase 2', 'Développement du site web', '2 semaines'],
        ['Phase 3', 'Intégration et tests', '1 semaine'],
        ['Phase 4', 'Formation et lancement', '1 semaine']
    ]
    
    phases.forEach(([phase, description, duration]) => {
        doc.text(phase, this.margin, this.currentY)
        doc.text(description, this.margin + 40, this.currentY)
        doc.text(duration, this.margin + 120, this.currentY)
        this.currentY += 6
    })
    
    if (clientData?.proposed_start_date) {
        this.currentY += 3
        doc.setFont('helvetica', 'bold')
        doc.text('Date de début prévue:', this.margin, this.currentY)
        doc.setFont('helvetica', 'normal')
        doc.text(this.formatDate(clientData.proposed_start_date), this.margin + 60, this.currentY)
        this.currentY += 6
    }
    
    if (clientData?.estimated_completion_date) {
        doc.setFont('helvetica', 'bold')
        doc.text('Achèvement estimé:', this.margin, this.currentY)
        doc.setFont('helvetica', 'normal')
        doc.text(this.formatDate(clientData.estimated_completion_date), this.margin + 60, this.currentY)
        this.currentY += 6
    }
    
    this.currentY += 15
    }

  /**
   * Add terms and conditions
   */
  addTermsSection() {
    const doc = this.doc
    
    this.addSectionTitle('CONDITIONS GÉNÉRALES')
    
    const terms = [
      '• Acompte de 50% requis pour démarrer le projet',
      '• Solde payable à la livraison du projet',
      '• Coûts mensuels facturés à partir du lancement',
      '• Formation incluse pour jusqu\'à 2 personnes',
      '• Support technique inclus pendant 30 jours',
      '• Propriété complète du site web client',
      '• Garantie de satisfaction ou remboursement',
      '• Révisions illimitées pendant le développement'
    ]

    doc.setFontSize(9)
    doc.setTextColor(52, 73, 94)
    
    terms.forEach(term => {
      doc.text(term, this.margin, this.currentY)
      this.currentY += 5
    })

    this.currentY += 10
  }

  /**
   * Add footer with contact information
   */
  addFooter() {
    const doc = this.doc
    
    // Footer background
    doc.setFillColor(44, 62, 80) // VAI Deep Ocean
    doc.rect(0, this.pageHeight - 30, this.pageWidth, 30, 'F')
    
    // Contact information
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTACT VAI STUDIO', this.margin, this.pageHeight - 20)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Email: hello@vai.studio', this.margin, this.pageHeight - 15)
    doc.text('WhatsApp: +689 87 26 90 65', this.margin, this.pageHeight - 10)
    doc.text('Web: vai.studio', this.margin, this.pageHeight - 5)
    
    // Website and social
    doc.text('Moorea, French Polynesia', this.pageWidth - 60, this.pageHeight - 15)
    doc.text('International Quality. Island Style.', this.pageWidth - 60, this.pageHeight - 10)
  }

  /**
   * Add section title with styling
   */
  addSectionTitle(title) {
    const doc = this.doc
    
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      doc.addPage()
      this.currentY = 20
    }
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 107, 107) // VAI Coral
    doc.text(title, this.margin, this.currentY)
    
    // Underline
    doc.setDrawColor(255, 107, 107)
    doc.setLineWidth(0.5)
    doc.line(this.margin, this.currentY + 2, this.margin + doc.getTextWidth(title), this.currentY + 2)
    
    this.currentY += 15
  }

  /**
   * Get status label in French
   */
  getStatusLabel(status) {
    switch (status) {
      case 'completed': return 'Terminé'
      case 'active': return 'En cours'
      case 'proposal': return 'Proposition'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  /**
   * Generate complete proposal PDF
   */
   generateProposal(clientData, proposalData, calculatedPricing) {
    try {
        console.log('🔄 Initializing PDF document...')
        this.initDocument()  // Remove await
        
        console.log('🔄 Adding PDF sections...')
        // Rest remains the same...
        this.addHeader()
        this.addProposalTitle(clientData)
        this.addClientSection(clientData)
        this.addPackageSection(proposalData, calculatedPricing)
        this.addFinancialSection(calculatedPricing)
        this.addServicesSection()
        this.addTimelineSection(clientData)
        this.addTermsSection()
        this.addFooter()
        
        // Generate filename
        const clientSlug = clientData?.company_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'client'
        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `VAI_Studio_Proposition_${clientSlug}_${dateStr}.pdf`
        
        console.log('✅ PDF generation completed successfully')
        return {
        success: true,
        doc: this.doc,
        filename
        }
    } catch (error) {
        console.error('❌ PDF Generation Error:', error)
        return {
        success: false,
        error: error.message
        }
    }
    }

  /**
   * Download the generated PDF
   */
  downloadPDF(clientData, proposalData, calculatedPricing) {
    const result = this.generateProposal(clientData, proposalData, calculatedPricing)  // Remove await
    
    if (result.success) {
        result.doc.save(result.filename)
        return { success: true, filename: result.filename }
    } else {
        return { success: false, error: result.error }
    }
    }

  /**
   * Preview PDF in new tab
   */
    previewPDF(clientData, proposalData, calculatedPricing) {
    const result = this.generateProposal(clientData, proposalData, calculatedPricing)  // Remove await
    
    if (result.success) {
        const pdfBlob = result.doc.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)
        window.open(pdfUrl, '_blank')
        return { success: true }
    } else {
        return { success: false, error: result.error }
    }
    }
}

// Export singleton instance
export const pdfGenerator = new VAIPDFGenerator()

// Export class for custom instances if needed
export { VAIPDFGenerator }

// Convenience functions
export const generateProposalPDF = (clientData, proposalData, calculatedPricing) => {
  return pdfGenerator.downloadPDF(clientData, proposalData, calculatedPricing)  // Remove async/await
}

export const previewProposalPDF = (clientData, proposalData, calculatedPricing) => {
  return pdfGenerator.previewPDF(clientData, proposalData, calculatedPricing)  // Remove async/await
}
