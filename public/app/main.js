'use strict';

(function () {

    class BookController {

        constructor($http, $mdMedia, $mdDialog) {
            this.message = 'Hello';
            this.$http = $http;
            this.appointment = [];
            this.slots = [];
            this.$mdMedia = $mdMedia;
            this.$mdDialog = $mdDialog;
            // this.ClickOnDate=ClickOnDate;
            // Configure dates
            var today = new Date();
            var dd = today.getDate();

            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (mm < 10) {
                mm = '0' + mm;
            }

            var d = new Date(yyyy, mm, 0);

            var datesArray = [];
            // Create date and slots array
            for (var i = 1; i < d.getDate() + 1; i++) {
                if (i < 10) {
                    dd = '0' + i;
                } else {
                    dd = i;
                }                
                var obj = { dd: dd, mm: mm-1, yyyy: yyyy, isshow: false };
                datesArray.push(obj);
            }
            //this.days = [{ dd: dd, mm: mm, yyyy: yyyy }, { dd: dd + 1, mm: mm, yyyy: yyyy }, { dd: dd + 2, mm: mm, yyyy: yyyy }, { dd: dd + 3, mm: mm, yyyy: yyyy }];
            this.days = datesArray;
            this.slots = [{ h: '10', m: '00' }, { h: '10', m: '15' }, { h: '10', m: '30' }, { h: '10', m: '45' }, { h: '11', m: '00' }, { h: '11', m: '15' }, { h: '11', m: '30' }];
        }
        ClickOnDate(day, dates) {

            var vm = this;
            var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs')) && this.customFullscreen;
            this.$mdDialog.show({
                controller: function ($scope, $mdDialog, $mdMedia) {
                    $scope.msg = "HELLO";
                    var dd1 = day.Date.getDay().toString().length == 1 ? ("0" + day.Date.getDay().toString()) : day.Date.getDay().toString();
                    $scope.SelectedDay = dates.filter(function (ele) {
                        return ele.Date.getDate() == day.Date.getDate();
                    })[0];

                    $scope.showAdvanced = function (slot) {

                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                        $mdDialog.show({
                            controller: function ($scope, $mdDialog, slot) {
                                $scope.customer = {};
                                $scope.customer.slot = slot;
                                $scope.answer = function (answer) {
                                    $mdDialog.hide(answer);
                                };
                            },
                            templateUrl: 'app/customer.html',
                            locals: {
                                slot: slot
                            },
                            clickOutsideToClose: true,
                            fullscreen: useFullScreen
                        })
                            .then(function (answer) {
                                answer.date = slot.date;
                                vm.save(answer);
                            });

                    };
                },
                templateUrl: 'app/time.html',
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
                .then(function (answer) {
                    // answer.date = answer.slot.date;
                    //vm.save(answer);
                });


        }

        save(appointment) {
            appointment.active = true;
            this.$http.post('/api/appointments', appointment).then(res => {
                this.dates = this.allot(this.slots, this.days, this.appointments);
                this.$http.get('/api/appointments').then(response => {
                    this.appointments = response.data;
                    debugger;
                    this.dates = this.allot(this.slots, this.days, this.appointments);
                });
            });

        }

        $onInit() {
            var vm = this;
            this.$http.get('/api/appointments').then(response => {
                this.appointments = response.data;
                debugger;
                this.dates = this.allot(this.slots, this.days, this.appointments);
            });
        }
        delete(d) {
            this.$http.delete('/api/appointments/' + d._id);
        }


        allot(slots, days, appointments) {
            var dateArray = [];
            _.each(days, function (d) {
                var ndate = new Date(d.yyyy, d.mm, d.dd);

                var appointmentsTime = [];
                _.each(slots, function (s) {
                    var slotdate = new Date(d.yyyy, d.mm, d.dd, s.h, s.m);
                    var mx = moment(slotdate);
                    var active = true;
                    _.each(appointments, function (g) {
                        var sdt = moment(new Date(g.date));
                        if (moment.duration(sdt.diff(mx))._milliseconds === 0) {
                            active = false;
                        }
                    });
                    appointmentsTime.push({ date: slotdate, active: active });
                });
                dateArray.push({ Date: ndate, AppointmentsTime: appointmentsTime });
            });
            return dateArray;
        }




        getColor($index) {
            var _d = ($index + 1) % 11;
            var bg = '';

            switch (_d) {
                case 1: bg = 'green'; break;
                case 2: bg = 'darkBlue'; break;
                case 3: bg = 'blue'; break;
                case 4: bg = 'yellow'; break;
                case 5: bg = 'pink'; break;
                case 6: bg = 'darkBlue'; break;
                case 7: bg = 'purple'; break;
                case 8: bg = 'deepBlue'; break;
                case 9: bg = 'lightPurple'; break;
                case 10: bg = 'red'; break;
                default: bg = 'yellow'; break;
            }

            return bg;
        }


    }

    angular.module('appointmentApp')
        .component('main', {
            templateUrl: 'app/main.html',
            controller: BookController
        });

})();