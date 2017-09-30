//META{"name":"Citador"}*//

class Citador {
	constructor() {
		this.locals = {
			'pt-BR': {
				description: "Cita alguém no chat",
				startMsg: "Iniciado",
				quoteTooltip: "Citar",
				deleteTooltip: "Excluir",
				noPermTooltip: "Sem permissão para citar",
				attachment: "Anexo"
			},
			'ru-RU': {
				description: "Котировки кто-то в чате",
				startMsg: "Начало",
				quoteTooltip: "Цитата",
				deleteTooltip: "Удалить",
				noPermTooltip: "Нет прав для цитирования",
				attachment: "Вложение"
			},
			'ja': {
				description: "誰かをチャットで引用します",
				startMsg: "起動完了",
				quoteTooltip: "引用",
				deleteTooltip: "削除",
				noPermTooltip: "引用する権限がありません",
				attachment: "添付ファイル"
			},
			'default': {
				description: "Quotes somebody in chat",
				startMsg: "Started",
				quoteTooltip: "Quote",
				deleteTooltip: "Delete",
				noPermTooltip: "No permission to quote",
				attachment: "Attachment"
			}
		};
		
		this.css = '@import url("https://rawgit.com/nirewen/2cf758092d3a13d3a59298bc43eb30c0/raw/906cfca10ea9689078d67f3130b609e2010d2736/style.css")';
		
		// Internal helpers
		this.getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
		this.getOwnerInstance = (e, {include, exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]} = {}) => {
			if (e === undefined)
				return undefined;
			const excluding = include === undefined;
			const filter = excluding ? exclude : include;
			function getDisplayName(owner) {
				const type = owner._currentElement.type;
				const constructor = owner._instance && owner._instance.constructor;
				return type.displayName || constructor && constructor.displayName || null;
			}
			function classFilter(owner) {
				const name = getDisplayName(owner);
				return (name !== null && !!(filter.includes(name) ^ excluding));
			}

			for (let prev, curr = this.getInternalInstance(e); !_.isNil(curr); prev = curr, curr = curr._hostParent) {
				if (prev !== undefined && !_.isNil(curr._renderedChildren)) {
					let owner = Object.values(curr._renderedChildren)
						.find(v => !_.isNil(v._instance) && v.getHostNode() === prev.getHostNode());
					if (!_.isNil(owner) && classFilter(owner))
						return owner._instance;
				}

				if (_.isNil(curr._currentElement))
					continue;
				let owner = curr._currentElement._owner;
				if (!_.isNil(owner) && classFilter(owner))
					return owner._instance;
			}

			return null;
		};
		this.WebpackModules = (() => {
			const req = webpackJsonp([], {
				'__extra_id__': (module, exports, req) => exports.default = req
			}, ['__extra_id__']).default;
			delete req.m['__extra_id__'];
			delete req.c['__extra_id__'];
			const find = (filter) => {
				for (let i in req.c) {
					if (req.c.hasOwnProperty(i)) {
						let m = req.c[i].exports;
						if (m && m.__esModule && m.default) m = m.default;
						if (m && filter(m)) return m;
					}
				}
				console.warn('Cannot find loaded module in cache. Loading all modules may have unexpected side effects');
				for (let i = 0; i < req.m.length; ++i) {
					let m = req(i);
					if (m && m.__esModule && m.default) m = m.default;
					if (m && filter(m)) return m;
				}
				console.warn('Cannot find module');
				return null;
			};
			
			const findByUniqueProperties = (propNames) => find(module => propNames.every(prop => module[prop] !== undefined));
			const findByDisplayName = (displayName) => find(module => module.displayName === displayName);
				
			return {find, findByUniqueProperties, findByDisplayName};
		})();
		
		this.MessageParser     = this.WebpackModules.findByUniqueProperties(["createBotMessage"]);
		this.MessageQueue      = this.WebpackModules.findByUniqueProperties(["enqueue"]);
		this.MessageController = this.WebpackModules.findByUniqueProperties(["sendClydeError"]);
		this.EventDispatcher   = this.WebpackModules.findByUniqueProperties(["dispatch"]);
		this.MainDiscord       = this.WebpackModules.findByUniqueProperties(["ActionTypes"]);
	}
	
	log(message, method) {
		switch (method) {
			case "warn":
				console.warn  ( `[${this.getName()}]`, message );
				break;
			case "error":
				console.error ( `[${this.getName()}]`, message );
				break;
			case "debug":
				console.debug ( `[${this.getName()}]`, message );
				break;
			case "info":
				console.info  ( `[${this.getName()}]`, message );
				break;
			default:
				console.log   ( `[${this.getName()}]`, message );
				break;
		}
	}
	
	cancelQuote() {
		$('.quote-msg').slideUp(150, () => { $('.quote-msg').remove() });
		$('.tooltip.citador').remove();
		this.quoteMsg   = null;
		this.quoteProps.messages.forEach(m => m.deleted = null);
		this.quoteProps = null;
		this.selectionP = null;
	}
	
	start() {
		var self = this;
		BdApi.injectCSS("citador-css", this.css);
		
		$(document).on("mouseover.citador", function(e) {
			var target = $(e.target);
			if (target.parents(".message").length > 0) {
				var todasMensagens = $('.messages .message-group'),
					nomeData       = $('.messages .message-group .comment .body h2'),
					citarBtn       = '<span class="citar-btn"></span>',
					closeBtn       = '<div class="quote-close"></div>',
					deleteMsgBtn   = '<div class="delete-msg-btn"></div>',
					quoteTooltip   = $("<div>").append(self.getLocal().quoteTooltip).addClass("tooltip tooltip-top tooltip-black citador"),
					deleteTooltip  = $("<div>").append(self.getLocal().deleteTooltip).addClass("tooltip tooltip-top tooltip-black citador"),
					noPermTooltip  = $("<div>").append(self.getLocal().noPermTooltip).addClass("tooltip tooltip-top tooltip-red citador");
				
				todasMensagens
				.on('mouseover', function() {
					if ($(this).find('.citar-btn').length == 0) {
						todasMensagens.hasClass('compact') ? $(this).find('.timestamp').first().prepend(citarBtn) : $(this).find(nomeData).append(citarBtn);
						$(this).find('.citar-btn')
							.on('mousedown.citador', function() {return false})
							.on('mouseover.citador', function() {
								$(".tooltips").append(quoteTooltip);
								let position = $(this).offset();
								position.top -= 40;
								position.left += $(this).width()/2 - quoteTooltip.width()/2 - 7;
								quoteTooltip.offset(position);
								$(this).on("mouseout.citador", function () {
									$(this).off("mouseout.citador");
									quoteTooltip.remove();
								});
							})
							.click(function() {
								self.attachParser();
								
								let message   = $(this).parents('.message-group'),
									mInstance = self.getOwnerInstance($(".messages")[0]),
									channel   = mInstance.props.channel,
									range;
								
								self.quoteProps = $.extend(true, {}, self.getOwnerInstance(message[0]).props);
									
								if (window.getSelection && window.getSelection().rangeCount > 0) {
									range = window.getSelection().getRangeAt(0);
								} else if (document.selection && document.selection.type !== 'Control') {
									range = document.selection.createRange();
								}
								var thisPost = $(this).closest('.comment');
								
								this.createQuote = function() {
									var messageElem = $(message).clone().hide().appendTo(".quote-msg");
									self.quoteMsg = $(".quote-msg");
									
									$('.quote-msg').find('.citar-btn').toggleClass('quoting');
									$('.quote-msg').find('.citar-btn').text('');
									
									$('.quote-msg').find('.embed').each(function() {
										$(this).closest('.accessory').remove();
									});
									
									$('.quote-msg').find('.markup').each(function() {
										if (0 === $(this).text().length + $(this).children().length + $(this).closest(".message").find('.accessory').length) {
											$(this).closest('.message-text').remove();
										}
									});
									$('.quote-msg').find('.message-content').each(function() {
										if (0 === $(this).text().length + $(this).children().length + $(this).closest(".message").find('.accessory').length) {
											$(this).closest('.message-text').remove();
										}
									});

									$('.quote-msg').find('.markup').before(deleteMsgBtn);
									$('.quote-msg').find('.edited, .btn-option, .btn-reaction').remove();
									
									$('.quote-msg .message-group').append(closeBtn);
									$('.quote-msg').find('.quote-close').click(function() {
										self.cancelQuote();
									});
									
									// define a função de clique, pra deletar uma mensagem que você não deseja citar
									$('.quote-msg').find('.delete-msg-btn')
										.click(function() {
											self.removeQuoteAtIndex($('.quote-msg .message').index($('.quote-msg .message').has(this)), () => deleteTooltip.remove());
										})
										.on('mouseover.citador', function() {
											$(".tooltips").append(deleteTooltip);
											var position = $(this).offset();
											position.top -= 40;
											position.left += $(this).width()/2 - deleteTooltip.width()/2 - 13;
											deleteTooltip.offset(position);
											$(this).on("mouseout.citador", function () {
												$(this).off("mouseout.citador");
												deleteTooltip.remove();
											});
										});
									
									$('.channel-text-area-default textarea').focus();

									if (range) {
										var startPost = $(range.startContainer).closest('.message'),
											endPost   = $(range.endContainer).closest('.message');
											
										if (thisPost.has(startPost) && thisPost.has(endPost) && startPost.length && endPost.length) {
											var startI   = thisPost.find(".message").index(startPost),
												endI     = thisPost.find(".message").index(endPost);
											
											if(range.startOffset != range.endOffset || startI != endI) {
												self.selectionP = {
													start: {
														index: startI,
														offset: range.startOffset
													},
													end: {
														index: endI,
														offset: range.endOffset
													}
												};
											
												self.quoteProps.messages.forEach((m, i) => {
													var msg = $($('.quote-msg .message')[i]).find(".markup");
													if(endI == startI) msg.text(m.content.substring(range.startOffset, range.endOffset));
													else if(i == startI) msg.text(m.content.substring(range.startOffset));
													else if(i == endI) msg.text(m.content.substring(0, range.endOffset));
													if(i < startI || i > endI) self.removeQuoteAtIndex(i);
												});
											}
										}
									}

									$('.quote-msg').find(".message")
										.on('mouseover.citador', function() {
											$(this).find('.delete-msg-btn').fadeTo(5, 0.4);
										})
										.on('mouseout.citador', function() {
											$(this).find('.delete-msg-btn').fadeTo(5, 0);
										});

									var canEmbed = channel.isPrivate() || mInstance.can(0x4800, {channelId: channel.id});
									if (!canEmbed) {
										$('.quote-msg').find('.citar-btn:not(.quoting).cant-embed').toggleClass('quoting', 'cant-embed');
										$('.quote-msg').find('.citar-btn:not(.cant-embed)').toggleClass('cant-embed');
										$('.quote-msg').find('.citar-btn').text("");
										$('.quote-msg').find('.citar-btn')
											.on('mouseover.citador', function() {
												if ($(this).hasClass('cant-embed')) {
													$(".tooltips").append(noPermTooltip);
													var position = $(this).offset();
													position.top -= 40;
													position.left += $(this).width()/2 - noPermTooltip.width()/2 - 7;
													noPermTooltip.offset(position);
													$(this).on("mouseout.citador", function () {
														$(this).off("mouseout.citador");
														noPermTooltip.remove();
													});
												}
											});
									}
									
									messageElem.slideDown(150);
								};
								
								if ($('.quote-msg .message-group').length > 0)
									$('.quote-msg .message-group').remove();
								else
									$('.channel-text-area-default').prepend('<div class="quote-msg"></div>');
								
								this.createQuote();
							});
					}
				})
				.on('mouseleave',function() {
					if ($(this).find('.citar-btn').length == 1) {
						$(this).find('.citar-btn').empty().remove();
					}
				});
			}
		});
		this.log(this.getLocal().startMsg, "info");
	}
	
	removeQuoteAtIndex(i, cb) {
		if(this.quoteProps.messages.filter(m => !m.deleted).length < 2) {
			this.cancelQuote();
		} else {
			let deleteMsg = $($('.quote-msg .message')[i]);								
			deleteMsg.find('.message-text, .accessory').hide();		
			this.quoteProps.messages[i].deleted = true;
			if(cb && typeof cb == 'function') cb();
		}
	}
	
	attachParser() {
		var el   = $('.channel-text-area-default textarea'),
			self = this;
			
		if (el.length == 0) return;
		
		this.handleKeypress = function(e) {
			var code = e.keyCode || e.which;
			if (code !== 13) return;
			try {
				var props = self.quoteProps;
				if (props) {
					if (e.shiftKey || $('.autocomplete-1TnWNR').length >= 1) return;
		
					var messages  = props.messages.filter(m => !m.deleted),
						guilds    = self.getOwnerInstance($(".guilds.scroller")[0]).state.guilds.map(o => o.guild),
						msg		  = props.messages[0],
						cc        = self.getOwnerInstance($("form")[0]).props.channel,
						msgC      = props.channel,
						msgG      = guilds.filter(g => g.id == msgC.guild_id)[0],
						
						author    = msg.author,
						avatarURL = author.getAvatarURL(),
						color     = Number(`0x${msg.colorString ? msg.colorString.slice(1) : 'ffffff'}`),
						msgCnt    = self.MessageParser.parse(cc, $('.channel-text-area-default textarea').val()),
						text      = '',
						atServer  = msgC.guild_id != cc.guild_id ? ` at ${msgG.name}` : '',
						chName    = msgC.isPrivate() ? `@${msgC._getUsers()[0].username}` : `#${msgC.name}`;
					
					if (self.selectionP) {
						var start = self.selectionP.start,
							end = self.selectionP.end;
						
						props.messages.forEach((m, i) => {
							if(!m.deleted) {
								var endText = m.content;
								if(end.index == start.index) endText = m.content.substring(start.offset, end.offset);
								else if(i == start.index) endText = m.content.substring(start.offset);
								else if(i == end.index) endText = m.content.substring(0, end.offset);
								if(i >= start.index && i <= end.index) text += `${endText}\n`;
							}
						});
					} else {
						text = messages.map(m => m.content).join('\n');
					}					
					
					// os dados do embed 
					let embed = {
							author: {
								name: msg.nick || author.username,
								icon_url: avatarURL.startsWith("https://") ? avatarURL : `https://discordapp.com/${avatarURL}`
							},
							description: text,
							footer: {
								text: `in ${chName}${atServer}`
							},
							color: color,
							timestamp: msg.timestamp.toISOString()
						},
						attachments = messages.map(m => m.attachments).reduce((a, b) => a.concat(b));
						
					if (attachments.length >= 1) {
						// checar se tem alguma imagem na mensagem citada, e adicionar ao embed final
						var imgAt = attachments.filter(a => a.width);
						if(imgAt.length >= 1)
							embed.image = {url: attachments[0].url};
						
						// checar se tem algum arquivo na mensagem citada, e adicionar ao embed final
						var otherAt = attachments.filter(a => !a.width);
						if(otherAt.length >= 1) {
							embed.fields = [];
							otherAt.forEach((at, i) => {
								var emoji = '📁';
								if (/(.apk|.appx|.pkg|.deb)$/.test(at.filename)) emoji = '📦';
								if (/(.jpg|.png|.gif)$/.test(at.filename)) emoji = '🖼';
								if (/(.zip|.rar|.tar.gz)$/.test(at.filename)) emoji = '📚';
								if (/(.txt)$/.test(at.filename)) emoji = '📄';
								
								embed.fields.push({name: `${self.getLocal().attachment} #${i+1}`, value: `${emoji} [${at.filename}](${at.url})`});
							});
						}
					}
					
					// cria uma mensagem com o conteúdo desejado (é necessário pra validar um "id")
					var msg = self.MessageParser.createMessage(cc.id, msgCnt.content);
					
					// adiciona a mensagem a lista de mensagens que serão enviadas
					self.MessageQueue.enqueue({
						type: "send",
						message: {
							channelId: cc.id,
							content: msgCnt.content,
							tts: false,
							nonce: msg.id,
							embed: embed
						}
					}, function(r) {
						r.ok ? (self.MessageController.receiveMessage(cc.id, r.body)) : (r.status >= 400 && r.status < 500 && r.body && self.MessageController.sendClydeError(cc.id, r.body.code),
						self.EventDispatcher.dispatch({
							type: self.MainDiscord.ActionTypes.MESSAGE_SEND_FAILED,
							messageId: msg.id,
							channelId: cc.id
						}))
					});
					
					$(this).val("").focus()[0].dispatchEvent(new Event('input', {bubbles: true}));
					
					self.cancelQuote();
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			} 
			catch (e) {
				self.log(e, "warn");
			}
		};
		el[0].addEventListener("keydown", this.handleKeypress, false);
		el[0].addEventListener("keyup", function(e) {
			if (e.keyCode == 27 && self.quoteProps) {
				self.cancelQuote();
			}
		}, false);
	}
	
	deleteEverything() {
		$(document).off("mouseover.citador");
		$('.messages .message-group').off('mouseover');
		$('.messages .message-group').off('mouseleave');
		BdApi.clearCSS("citador-css");
	}
	
	getLocal        () { return this.locals[navigator.language] || this.locals["default"] }
	getName         () { return "Citador";                  }
	getDescription  () { return this.getLocal().description }
	getVersion      () { return "1.6.0";                    }
	getAuthor       () { return "Nirewen";             		}
	getSettingsPanel() { return "";                    		}
	unload          () { this.deleteEverything();      		}
	stop            () { this.deleteEverything();      		}
	load            () {                               		}
	onSwitch        () {
		this.attachParser();
		if (this.quoteProps) {
			var channel       = this.getOwnerInstance($(".messages")[0], {include:["Channel"]}),
				canEmbed      = channel.state.channel.isPrivate() || channel.can(0x4800, {channelId: channel.state.channel.id}),
				noPermTooltip = $("<div>").append(this.getLocal().noPermTooltip).addClass("tooltip tooltip-top tooltip-red citador");
			
			if (!canEmbed) {
				$('.quote-msg').find('.citar-btn:not(.quoting).cant-embed').toggleClass('quoting', 'cant-embed');
				$('.quote-msg').find('.citar-btn:not(.cant-embed)').toggleClass('cant-embed');
				$('.quote-msg').find('.citar-btn').text("");
				$('.quote-msg').find('.citar-btn')
					.on('mouseover.citador', function() {
						if ($(this).hasClass('cant-embed')) {
							$(".tooltips").append(noPermTooltip);
							var position = $(this).offset();
							position.top -= 40;
							position.left += $(this).width()/2 - noPermTooltip.width()/2 - 7;
							noPermTooltip.offset(position);
							$(this).on("mouseout.citador", function () {
								$(this).off("mouseout.citador");
								noPermTooltip.remove();
							});
						}
					});
			} else {
				$('.quote-msg').find('.citar-btn:not(.quoting)').toggleClass('quoting');
				$('.quote-msg').find('.citar-btn.cant-embed').toggleClass('cant-embed');
				$('.quote-msg').find('.citar-btn').text("");
			}
			$('.channel-text-area-default').prepend(this.quoteMsg);
		}
	}
}