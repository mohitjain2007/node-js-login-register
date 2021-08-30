--
-- Database: `node_app`
--
CREATE DATABASE IF NOT EXISTS `node_app` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `node_app`;

-- --------------------------------------------------------

--
-- Table structure for table `survey`
--

DROP TABLE IF EXISTS `survey`;
CREATE TABLE `survey` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `blueent_hear` varchar(50) NOT NULL,
  `php_rate` varchar(5) NOT NULL,
  `php_framework` varchar(255) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `survey`
--

INSERT INTO `survey` (`id`, `user_id`, `blueent_hear`, `php_rate`, `php_framework`, `created_date`) VALUES
(1, 15, 'Naukri.com', '7', 'Code Igniter, Cake PHP, Laravel, Zend', '2021-08-30 06:41:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_email` varchar(50) NOT NULL,
  `user_pass` varchar(32) NOT NULL,
  `user_fname` varchar(50) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'INACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_email`, `user_pass`, `user_fname`, `status`) VALUES
(1, 'mohitjain2007@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', 'MOHIT JAIN', 'ACTIVE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `survey`
--
ALTER TABLE `survey`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `UK_user_email` (`user_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `survey`
--
ALTER TABLE `survey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;