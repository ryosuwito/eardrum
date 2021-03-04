const messages = {
  a: {
    name: 'Brokerage Account Disclosure',
    path: 'brokerage-account-disclosure',
    shortName: 'BAD',
    text: {
      overview:
        'Every employee must disclose to the CCO any and all brokerage accounts in the name of the employee, over which the employee exercises discretion (expressor or in fact) or in which the employee has an interest.',
      non_required_title: 'Disclosure is not required for any account:',
      non_required_items: [
        'over which the employee has no control or discretionary trading authority (including Managed Accounts), or',
        'used exclusively for trading in commodities and futures contracts and do not have discretionary brokerage capability for individual securities; or',
        'that is limited to exempted securities such as bank certificates of deposit, open-end mutual fund shares, and Treasury obligations, and does not have discretionary brokerage capability for individual securities (e.g., 529 and 401(k) accounts).',
      ],
      option_title: 'Please check one of the following and sign below:',
      options: [
        {
          key: 'do_not_have',
          label:
            'I do not have any accounts that must be disclosed. I agree to notify the CCO prior to any such account being opened in the future.',
        },
        {
          key: 'have',
          label:
            'Set forth below is a complete list of all accounts that must be disclosed (use additional forms if necessary).',
        },
      ],
      note:
        'The CCO will be sending a letter requesting duplicate confirms and statements for each of the accounts disclosed below.',
      account_headers: ['Name of Firm Where Account is Held', 'Name on Account', 'Account Number'],
      policy:
        'I have read and understand the Personal Securities Trading Policies referenced in the Code of Ethics and Compliance Manual, and I agree to abide by such policies during the term of my employment.',
    },
  },
  b: {
    name: 'Employee Securities Holdings Report',
    text: {
      yearSelectTitle: 'As of:',
      options_title: 'I hereby declare that:',
      options: [
        {
          key: 'do_not_have',
          label: 'I do not have any reportable brokerage accounts.',
        },
        {
          key: 'have',
          label: 'I have reported all reportable holdings in my personal brokerage accounts.',
        },
      ],

      note: 'Please submit your annual statement(s) from each reportable brokerage account.',
    },
  },
  c: {
    name: 'Employee Quarterly Trade Report',
    text: {
      title: 'I declare that:',
      quarterYearSelectTitle: 'As of the end of',
      quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
      box1: {
        title: 'I hereby declare that (tickbox):',
        radioGroupOptions: [
          { key: 'do_not_engage', label: 'I have not engaged in personal account dealing' },
          {
            key: 'engage_not_exceed',
            label: 'I have engaged in personal account dealing, not exceeding the limit of S$10,000 (ten thousand)',
          },
          {
            key: 'engage_exceed',
            label:
              'I have engaged in personal account dealing, and obtained prior approval to trade on a single stock on the same day (i.e 24 hours) for an amount exceeding S$10,000 (ten thousand)',
          },
        ],
        columns: [
          {
            title: 'Stock Ticker',
            dataIndex: 'stockTicker',
          },
          {
            title: 'Exchange which the security is listed on',
            dataIndex: 'listedOn',
          },
          {
            title: 'Total value on the date of accquisition/sale(SGD)',
            dataIndex: 'totalValue',
            inputType: 'number',
          },
          {
            title: 'Long/Sell/Short',
            dataIndex: 'type',
            inputType: 'select',
            options: ['Long', 'Sell', 'Short'],
          },
          {
            title: 'Date of sale/accquisition or other(DD/MM/YYYY)',
            dataIndex: 'date',
            inputType: 'date',
          },
        ],
        lastRadioItemNote:
          'Complete the details below in case of personal account dealing on a single stock on the same day and exceeding the amount of S$10,000 (ten thousand):',
      },
      box2: {
        title: 'I hereby confirm that:',
        checkboxGroupTitles: [
          'My personal dealing activities and those of any Related Persons are in accordance with the Rules set out in this Manual',
          'To the best of my knowledge, my personal dealing activities will not raise any conflict of interest with the Company or any of its clients',
          'I am not aware of any pending client order, current or upcoming client soliciation, in relation to my personal dealing activities',
          'My personal dealing activities do not breach any relevant holding or blackout period by the Manual',
        ],
      },
      box3: {
        title: 'Furthermore, I hereby confirm that:',
        checkboxGroupTitles: [
          'I have not been engaged in and will do everything in my power to abstain from engaging in the prohibited market practices set out in this Manual',
          'I do not possess or have access to relevant material non-public and price sensitive information when dealing on behalf of my personal account, or that of the Company or its clients',
          'I am aware of the rules and standards set out in the DTL Compliance Manual, and I am and will be fully compliant with these rules and standards',
          'I agree to bring to the attention of the CCO any change in circumstances that could or would render this statement false',
          'I agree to appropriately file Form F1A if required according to the circumstances',
          'I understand that failure to comply with the Rules may result in disciplinary action and possible dismissal',
          'I understand that violation of the rules may also lead to civil or criminal penalties under the applicable laws and regulations',
          'The CCO has the power to recommend the relevant trade to be reversed and if there is any financial gain, it will be donated to a charity of DTL choice',
        ],
      },
      confirm: 'I declare that all information given in this form is true and correct.',
    },
  },
  d: {
    name: 'Request for Pre-Clearance of Securities Trade',
    text: {
      list: {
        title: 'The Employee submitting this request understands and specifically represents as follows:*',
        items: [
          'I have no inside information relating to the above-referenced issuer(s);',
          'I have not had any contact or communication with the issuer(s) in the last six months;',
          'I am not aware of any conflict of interest this transaction may cause with respect to any Client account and I am not aware of any Client account trading activity that may have occurred in the issuers of the above referenced securities during the past four trading days or that may now or in the near future be contemplated;',
          'If approval is granted, it is only good for one day and specifically the day it was approved (e.g., expiring at midnight on the day of approval); and',
          'The securities are not being purchased in an initial public offering or private placement.',
        ],
      },
      columns: [
        {
          title: 'Date',
          dataIndex: 'date',
          inputType: 'date',
        },
        {
          title: 'NAME OF SECURITY',
          dataIndex: 'securityName',
        },
        {
          title: 'ACCOUNT',
          dataIndex: 'account',
        },
        {
          title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
          dataIndex: 'SHRSOrder',
          inputType: 'number',
        },
        {
          title: 'APPROX PRICE',
          dataIndex: 'approxPrice',
          inputType: 'number',
        },
        {
          title: 'SYMBOL OR CUSIP #',
          dataIndex: 'symbolOrCusipOrder',
        },
        {
          title: 'PURCHASE(P) SALE(S)',
          dataIndex: 'purchaseSale',
          inputType: 'select',
          options: ['PURCHASE', 'SALE'],
        },
      ],
      note:
        'If for any reason an employee cannot make the above required representations or has any questions in this area, the employee MUST contact the CCO before submitting any request for approval.',
    },
  },
};

export default messages;
