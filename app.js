import TemplateLoader from './js/template-loader.js';

new Vue({
  el: '#app',
  data: {
    cardData: {
      name: 'Lily Wang',
      title: 'Sales Manager',
      phone: '18120192758',
      email: 'sales@lilysunshine.net',
      address: 'XIAOGUANGZHUANG TOWN, BAOYING COUNTY, YANGZHOU CITY, JIANGSU PROVINCE,CHINA',
      logo: '',
      company: 'Yangzhou Lily Sunshine Co., Ltd',
      website: 'https://lilysunshine.net',
    },
    qrCode: null,
    selectedTemplate: null,
    templates: []
  },
  async created() {
    try {
      const templateLoader = new TemplateLoader();
      this.templates = await templateLoader.loadTemplates();
      this.selectedTemplate = this.templates[0]?.id || '';
      console.log('this.selectedTemplate', this.selectedTemplate)

      if (this.cardData.website) {
        this.generateQRCode();
      }
    } catch (error) {
      console.error('初始化模板失败:', error);
    }
  },
  computed: {
    currentTemplate() {
      const template = this.templates.find(t => t.id === this.selectedTemplate) || {};
      console.log('template', template)
      return template;
    }
  },
  methods: {
    handleLogoUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.cardData.logo = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    handleQrcodeUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.cardData.qrcode = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    exportCard() {
      html2canvas(document.querySelector('.card-template'), {
        logging: true,
        useCORS: true,
        scale: window.devicePixelRatio * 2
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-card.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    },
    generateQRCode() {
      if (!this.cardData.website) return;
      if (this.qrCode) {
        this.qrCode.clear();
        this.qrCode.makeCode(this.cardData.website);
      } else {
        this.qrCode = new window.QRCode(document.getElementById('qrcode-container'), {
          text: this.cardData.website,
          width: 80,
          height: 80
        });
      }
    }
  },
  watch: {
    'cardData.website': function(newVal) {
      if (newVal) {
        this.generateQRCode();
      } else {
        this.qrCode.clear();
      }
    }
  }
});