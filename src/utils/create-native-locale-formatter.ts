import Pad from './pad';

export default (locale: string, options: any, { start, length } = { start: 0, length: 0 }) => {
      // 适配IOS
      const makeIsoString = (dateString: string) => {
            const [year, month, date] = dateString.trim().split(' ')[0].split('-');

            return [year, Pad(month || 1), Pad(date || 1)].join('-');
      };

      try {
            // 初始化 根据语言来格式化日期和时间的对象
            const intlFormatter = new Intl.DateTimeFormat(locale || undefined, options);

            return (dateString: string) => {
                  return intlFormatter.format(new Date(`${makeIsoString(dateString)}T00:00:00+00:00`));
            };
      }
      catch (e) {
            return (start || length) ? (dateString: string) => makeIsoString(dateString).substr(start, length) : null;
      }
};
