class TemplateLoader {
  constructor() {
    this.templates = [];
  }

  async loadTemplates() {
    try {
      // 先加载模板索引文件
      const indexResponse = await fetch('/templates/index.json');
      const indexData = await indexResponse.json();

      // 并行加载所有模板配置
      this.templates = await Promise.all(
        indexData.templates.map(async template => {
          const res = await fetch(`/templates/${template.path}`);
          const config = await res.json();
          if (!config.elements) {
            throw new Error(`模板${template.id}配置错误：缺少有效的elements字段`);
          }
          return config;
        })
      );

      return this.templates;
    } catch (error) {
      console.error('模板加载失败:', error);
      return [];
    }
  }
}

export default TemplateLoader;