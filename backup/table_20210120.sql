-- --------------------------------------------------------
-- 호스트:                          dev.thekeytech.co.kr
-- 서버 버전:                        10.5.8-MariaDB-1:10.5.8+maria~focal - mariadb.org binary distribution
-- 서버 OS:                        debian-linux-gnu
-- HeidiSQL 버전:                  10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- test 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `test`;

-- 테이블 test.apt 구조 내보내기
CREATE TABLE IF NOT EXISTS `apt` (
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `complex_name` varchar(50) NOT NULL COMMENT '건물명',
  `cortar_no` varchar(12) NOT NULL COMMENT '지역번호',
  `real_estate_type_code` varchar(10) NOT NULL COMMENT '구분',
  `real_estate_type_name` varchar(30) NOT NULL COMMENT '구분명',
  `total_house_hold_count` int(11) NOT NULL DEFAULT 0 COMMENT '세대수',
  `total_dong_count` int(11) NOT NULL DEFAULT 0 COMMENT '총 동수',
  `high_floor` int(11) NOT NULL DEFAULT 0 COMMENT '최고층',
  `low_floor` int(11) NOT NULL DEFAULT 0 COMMENT '최저층',
  `use_approve_ymd` varchar(50) DEFAULT NULL COMMENT '사용승인일',
  `min_supply_area` float NOT NULL DEFAULT 0 COMMENT '최소 공급면적',
  `max_supply_area` float NOT NULL DEFAULT 0 COMMENT '최대 공급면적',
  `parking_possible_count` int(11) NOT NULL DEFAULT 0 COMMENT '총주차대수',
  `parking_house_count` float NOT NULL DEFAULT 0 COMMENT '세대당 주차대수',
  `construction_company_name` varchar(50) DEFAULT NULL COMMENT '건설사',
  `pyoeng_names` varchar(200) NOT NULL COMMENT '전체 평형',
  `latitude` float NOT NULL DEFAULT 0 COMMENT '위도',
  `longitude` float NOT NULL DEFAULT 0 COMMENT '경도',
  `batl_ratio` int(11) NOT NULL DEFAULT 0 COMMENT '용적률',
  `btl_ratio` int(11) NOT NULL DEFAULT 0 COMMENT '건폐율',
  `address` varchar(100) NOT NULL COMMENT '주소',
  `detail_address` varchar(150) NOT NULL COMMENT '상세주소',
  `road_address_prefix` varchar(50) NOT NULL COMMENT '도로명 주소',
  `road_address` varchar(50) DEFAULT NULL COMMENT '도로명 상세주소',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`complex_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='아파트 정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.apt_article_hist 구조 내보내기
CREATE TABLE IF NOT EXISTS `apt_article_hist` (
  `ymd` varchar(8) NOT NULL COMMENT '년월일',
  `trade_type` varchar(3) NOT NULL COMMENT '거래구분',
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `pyeong_name` varchar(10) NOT NULL COMMENT '평명',
  `update_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '수정여부',
  `stats_update_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '통계 수정여부',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`ymd`,`trade_type`,`complex_no`,`pyeong_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='아파트 매물 이력';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.apt_pyeong 구조 내보내기
CREATE TABLE IF NOT EXISTS `apt_pyeong` (
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `pyeong_name` varchar(10) NOT NULL COMMENT '평명',
  `complex_name` varchar(50) NOT NULL COMMENT '건물명',
  `real_estate_type_code` varchar(10) NOT NULL COMMENT '구분',
  `cortar_no` varchar(12) NOT NULL COMMENT '지역번호',
  `area_nos` varchar(50) NOT NULL COMMENT '해당평형 번호',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`complex_no`,`pyeong_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='아파트 평정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.article 구조 내보내기
CREATE TABLE IF NOT EXISTS `article` (
  `ymd` varchar(8) NOT NULL COMMENT '연월일',
  `article_no` varchar(12) NOT NULL COMMENT '매물번호',
  `article_name` varchar(100) NOT NULL COMMENT '매물명',
  `trade_type` varchar(5) NOT NULL COMMENT '거래구분(매매/전세/월세)',
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `pyeong_name` varchar(10) NOT NULL COMMENT '평명',
  `pyeong_no` int(11) NOT NULL DEFAULT 0 COMMENT '평번호',
  `cortar_no` varchar(12) NOT NULL COMMENT '지역번호',
  `price_state` varchar(10) NOT NULL COMMENT '가격 상승/하락 상태',
  `deal_price` int(11) NOT NULL DEFAULT 0 COMMENT '매매 가격',
  `warrant_price` int(11) NOT NULL DEFAULT 0 COMMENT '전월세 가격',
  `rent_price` int(11) NOT NULL DEFAULT 0 COMMENT '월세',
  `all_warrant_price` int(11) NOT NULL DEFAULT 0 COMMENT '기보증금',
  `all_rent_price` int(11) NOT NULL DEFAULT 0 COMMENT '기월세',
  `same_addr_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '동일매물 중개사 수',
  `dong` varchar(10) DEFAULT NULL COMMENT '동',
  `ho` varchar(10) DEFAULT NULL COMMENT '호수',
  `total_floor` varchar(10) NOT NULL COMMENT '총층',
  `floor` varchar(10) NOT NULL COMMENT '해당층',
  `article_desc` varchar(200) DEFAULT NULL COMMENT '매물설명',
  `move_code` varchar(10) NOT NULL COMMENT '입주가능 코드',
  `move_month` varchar(10) DEFAULT NULL COMMENT 'n개월 이내 입주가능',
  `move_after_ym` varchar(8) DEFAULT NULL COMMENT '입주가능일',
  `filter_type` varchar(10) DEFAULT NULL COMMENT '필터구분',
  `confirm_ymd` varchar(8) NOT NULL COMMENT '매물 확인일자',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`ymd`,`article_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='매물 정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.batch_hist 구조 내보내기
CREATE TABLE IF NOT EXISTS `batch_hist` (
  `ymd` varchar(8) NOT NULL COMMENT '일자',
  `batch_type` varchar(10) NOT NULL COMMENT '배치구분',
  `status` varchar(10) NOT NULL COMMENT '상태',
  `start_dt` datetime DEFAULT NULL COMMENT '시작일',
  `end_dt` datetime DEFAULT NULL COMMENT '종료일',
  `error_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '에러횟수',
  `error_msg` longtext DEFAULT NULL COMMENT '에러메시지',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='배치 이력';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.pyeong 구조 내보내기
CREATE TABLE IF NOT EXISTS `pyeong` (
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `pyeong_no` int(11) NOT NULL DEFAULT 0 COMMENT '평번호',
  `supply_area_double` float NOT NULL DEFAULT 0 COMMENT '공급면적',
  `supply_area` float NOT NULL DEFAULT 0 COMMENT '공급면적',
  `pyeong_name` varchar(10) NOT NULL COMMENT '공급평명',
  `supply_pyeong` float NOT NULL DEFAULT 0 COMMENT '공급평',
  `pyeong_name2` varchar(10) NOT NULL COMMENT '전용평명',
  `exclusive_area` float NOT NULL DEFAULT 0 COMMENT '전용면적',
  `exclusive_pyeong` float NOT NULL DEFAULT 0 COMMENT '전용평',
  `house_count` int(11) NOT NULL DEFAULT 0 COMMENT '해당면적 세대수',
  `real_estate_type_code` varchar(50) NOT NULL COMMENT '구분',
  `entrance_type` varchar(50) NOT NULL COMMENT '복도식/계단식',
  `exclusive_rate` int(11) NOT NULL DEFAULT 0 COMMENT '전용률',
  `room_count` int(11) NOT NULL DEFAULT 0 COMMENT '방수',
  `bath_room_count` int(11) NOT NULL DEFAULT 0 COMMENT '욕실수',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`complex_no`,`pyeong_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='평 정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.rate 구조 내보내기
CREATE TABLE IF NOT EXISTS `rate` (
  `ymd` varchar(8) NOT NULL,
  `cortar_no` varchar(15) NOT NULL COMMENT '지역번호',
  `real_estate_type_code` varchar(10) NOT NULL COMMENT '주택유형',
  `rate` float NOT NULL DEFAULT 0 COMMENT '전환률',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`ymd`,`cortar_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='전월세 전환률';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.regions 구조 내보내기
CREATE TABLE IF NOT EXISTS `regions` (
  `cortar_no` varchar(12) NOT NULL COMMENT '지역번호',
  `cortar_name` varchar(50) NOT NULL COMMENT '지역명',
  `cortar_type` varchar(10) NOT NULL COMMENT '지역구분(시군구/읍면동)',
  `center_lat` float NOT NULL COMMENT '위도',
  `center_lon` float NOT NULL COMMENT '경도',
  `insert_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일',
  PRIMARY KEY (`cortar_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='지역정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.stats 구조 내보내기
CREATE TABLE IF NOT EXISTS `stats` (
  `ymd` varchar(8) NOT NULL COMMENT '년월일',
  `trade_type` varchar(5) NOT NULL COMMENT '거래구분',
  `complex_no` varchar(10) NOT NULL COMMENT '건물번호',
  `pyeong_name` varchar(10) NOT NULL COMMENT '평명',
  `filter_type` varchar(10) NOT NULL COMMENT '필터구분',
  `article_count` int(11) NOT NULL DEFAULT 0 COMMENT '매물수',
  `min_price` int(11) NOT NULL DEFAULT 0 COMMENT '최소가격',
  `max_price` int(11) NOT NULL DEFAULT 0 COMMENT '최대가격',
  `avg` int(11) NOT NULL DEFAULT 0 COMMENT '평균가격',
  `median` int(11) NOT NULL DEFAULT 0 COMMENT '중위가격',
  `avg_low` int(11) NOT NULL DEFAULT 0 COMMENT '최소평균 가격',
  `avg_high` int(11) NOT NULL DEFAULT 0 COMMENT '최대평균 가격',
  `deviation` int(11) NOT NULL DEFAULT 0 COMMENT '표준편차',
  `same_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '동일가격 매물수',
  `increase_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '가격증가 매물수',
  `decrease_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '가격감소 매물수',
  `rate` float NOT NULL DEFAULT 0 COMMENT '전월세 전환률',
  `del_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '삭제매물수',
  `add_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '신규매물수',
  `floor` varchar(10) DEFAULT NULL COMMENT '최저가 매물층수',
  `update_dt` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`ymd`,`trade_type`,`complex_no`,`pyeong_name`,`filter_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='통계 정보';

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
